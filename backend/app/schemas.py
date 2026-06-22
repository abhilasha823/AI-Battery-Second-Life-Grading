from datetime import datetime

from pydantic import BaseModel, Field


class BatteryInput(BaseModel):
    battery_id: str
    voltage: float
    current: float
    temperature: float
    cycle_count: int = Field(ge=0)
    capacity: float = Field(ge=0)
   


class PredictionResult(BatteryInput):
    id: int

    soh: float
    predicted_soh: float

    grade: str
    recommendation: str

    passport_id: str

    rul_years: float

    residual_value: float

    ai_explanation: list[str] = []

    co2_saved: float

    created_at: datetime

    risk_alerts: list[str] = []

    risk_level: str | None = None

    confidence: float = 0

    model_config = {"from_attributes": True}


class Metrics(BaseModel):
    total_batteries: int
    average_soh: float
    reuse_candidates: int
    recycling_candidates: int
    refurbish_candidates: int

    total_co2_saved: float
    total_residual_value: float
    average_rul_years: float
    

    
