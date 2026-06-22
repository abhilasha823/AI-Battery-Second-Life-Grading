import csv
import io
import os

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .grading import grade_battery, recommendation_for_grade
from .ml import (
    ModelLoadError,
    predict_soh_with_confidence,
    predict_soh
)
from .models import BatteryPrediction
from .schemas import BatteryInput, Metrics, PredictionResult
from .ml import get_feature_importances
from .grading import (
    grade_battery,
    recommendation_for_grade,
    estimate_rul,
    estimate_residual_value,
    estimate_co2_saved,
    get_risk_alert,
    get_risk_level,
    explain_prediction,
)

REQUIRED_COLUMNS = {
    "battery_id",
    "voltage",
    "current",
    "temperature",
    "cycle_count",
    "capacity",
}

app = FastAPI(
    title="EV Battery Second-Life Grading API",
    description="Predicts battery SOH, grade, and second-life recommendation from CSV telemetry.",
    version="1.0.0",
)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "AI Battery Second Life Grading API"
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def persist_prediction(db: Session, battery: BatteryInput) -> BatteryPrediction:

    predicted_soh = predict_soh(battery)

    predicted_soh, confidence = predict_soh_with_confidence(
      battery
    )

    grade = grade_battery(predicted_soh)

    recommendation = recommendation_for_grade(grade)

    rul_years = estimate_rul(predicted_soh)

    residual_value = estimate_residual_value(predicted_soh)

    co2_saved = estimate_co2_saved(grade)

    ai_explanation = explain_prediction(
      battery.voltage,
      battery.current,
      battery.temperature,
      battery.cycle_count,
      battery.capacity,
    )

    passport_id = f"PASS-{battery.battery_id}"

    prediction = BatteryPrediction(
        **battery.model_dump(),
        soh=predicted_soh,
        grade=grade,
        recommendation=recommendation,

        passport_id=passport_id,
        rul_years=rul_years,
        residual_value=residual_value,
        co2_saved=co2_saved,
        confidence=confidence,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    prediction.ai_explanation = explain_prediction(
      battery.voltage,
      battery.current,
      battery.temperature,
      battery.cycle_count,
      battery.capacity,
    )

    prediction.risk_alerts = get_risk_alert(
        battery.voltage,
        battery.current,
        battery.temperature,
        battery.cycle_count,
        predicted_soh,
    )

    prediction.risk_level = get_risk_level(
        battery.temperature,
        battery.cycle_count,
        predicted_soh,
    )

    return prediction


@app.get("/passport/{battery_id}", response_model=PredictionResult)
def get_passport(
    battery_id: str,
    db: Session = Depends(get_db),
):
    battery = db.scalar(
        select(BatteryPrediction)
        .where(BatteryPrediction.battery_id == battery_id)
        .order_by(BatteryPrediction.created_at.desc())
    )

    if not battery:
        raise HTTPException(
            status_code=404,
            detail="Battery not found",
        )

    return battery


@app.post("/predict", response_model=list[PredictionResult])
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> list[BatteryPrediction]:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8 encoded.") from exc

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
       raise HTTPException(status_code=400, detail="CSV file is empty.")

    required = {
     "voltage",
     "current",
     "temperature",
     "cycle_count",
     "capacity",
    }

    missing = required.difference(reader.fieldnames)
    if missing:
        raise HTTPException(
        status_code=400,
        detail=f"CSV is missing required columns: {', '.join(sorted(missing))}",
        )

    predictions: list[BatteryPrediction] = []
    for index, row in enumerate(reader, start=2):
        try:
            battery = BatteryInput(
               battery_id=row.get("battery_id", f"NASA-{index}"),
               voltage=float(row["voltage"]),
               current=float(row["current"]),
               temperature=float(row["temperature"]),
               cycle_count=int(row["cycle_count"]),
               capacity=float(row["capacity"]),
            )
        except (TypeError, ValueError) as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid numeric value on CSV row {index}.",
            ) from exc

        if not battery.battery_id:
            raise HTTPException(
                status_code=400,
                detail=f"battery_id is required on CSV row {index}.",
            )

        try:
            predictions.append(persist_prediction(db, battery))
        except ModelLoadError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

    if not predictions:
        raise HTTPException(status_code=400, detail="CSV must contain at least one battery row.")

    return predictions


@app.get("/batteries", response_model=list[PredictionResult])
def list_batteries(db: Session = Depends(get_db)) -> list[BatteryPrediction]:
    statement = select(BatteryPrediction).order_by(BatteryPrediction.created_at.desc()).limit(100)
    return list(db.scalars(statement))


@app.get("/metrics", response_model=Metrics)
def metrics(db: Session = Depends(get_db)) -> Metrics:
    total = db.scalar(select(func.count(BatteryPrediction.id))) or 0

    average = db.scalar(
        select(func.avg(BatteryPrediction.soh))
    ) or 0

    reuse = db.scalar(
        select(func.count(BatteryPrediction.id))
        .where(BatteryPrediction.recommendation == "Reuse")
    ) or 0

    refurbish = db.scalar(
        select(func.count(BatteryPrediction.id))
        .where(BatteryPrediction.recommendation == "Refurbish")
    ) or 0

    recycling = db.scalar(
        select(func.count(BatteryPrediction.id))
        .where(BatteryPrediction.recommendation == "Recycle")
    ) or 0

    total_co2_saved = db.scalar(
        select(func.sum(BatteryPrediction.co2_saved))
    ) or 0

    total_residual_value = db.scalar(
        select(func.sum(BatteryPrediction.residual_value))
    ) or 0

    average_rul = (
    db.scalar(
        select(func.avg(BatteryPrediction.rul_years)))
    or 0
    )

    return Metrics(
        total_batteries=total,
        average_soh=round(float(average), 2),

        reuse_candidates=reuse,
        refurbish_candidates=refurbish,
        recycling_candidates=recycling,

        total_co2_saved=round(float(total_co2_saved), 2),
        total_residual_value=round(float(total_residual_value), 2),
        average_rul_years=round(float(average_rul), 1)
    )

@app.get("/feature-importance")
def feature_importance():
    return get_feature_importances()
