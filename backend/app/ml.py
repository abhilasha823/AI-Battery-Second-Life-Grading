from pathlib import Path
from typing import Any
import numpy as np

try:
    import joblib
except ImportError:  # pragma: no cover - exercised only when dependencies are missing.
    joblib = None


FEATURE_COLUMNS = ["voltage", "current", "temperature", "cycle_count", "capacity"]
MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "soh_model.pkl"

_model: Any | None = None
_model_load_error: str | None = None


class ModelLoadError(RuntimeError):
    pass


def _read_feature(data: Any, feature: str) -> float:
    if isinstance(data, dict):
        value = data[feature]
    else:
        value = getattr(data, feature)
    return float(value)


def load_model() -> Any:
    global _model, _model_load_error

    if _model is not None:
        return _model

    if joblib is None:
        _model_load_error = "joblib is not installed. Run `pip install -r requirements.txt`."
        raise ModelLoadError(_model_load_error)

    if not MODEL_PATH.exists():
        _model_load_error = (
            f"Trained SOH model not found at {MODEL_PATH}. "
            "Run `python models/train_model.py` from the backend directory first."
        )
        raise ModelLoadError(_model_load_error)

    try:
        bundle = joblib.load(MODEL_PATH)
        _model = bundle["model"] if isinstance(bundle, dict) and "model" in bundle else bundle
    except Exception as exc:  # pragma: no cover - depends on corrupted external model files.
        _model_load_error = f"Unable to load trained SOH model: {exc}"
        raise ModelLoadError(_model_load_error) from exc

    return _model


def predict_soh(data: Any) -> float:
    model = load_model()

    try:
        features = [[_read_feature(data, feature) for feature in FEATURE_COLUMNS]]
        prediction = float(model.predict(features)[0])
    except Exception as exc:
        raise ModelLoadError(f"Unable to generate SOH prediction: {exc}") from exc

    return round(max(0.0, min(100.0, prediction)), 2)


def get_feature_importances():
    model = load_model()

    return {
        feature: round(importance * 100, 2)
        for feature, importance in zip(
            FEATURE_COLUMNS,
            model.feature_importances_,
        )
    }


def predict_soh_with_confidence(data: Any):
    model = load_model()

    try:
        features = [[_read_feature(data, feature) for feature in FEATURE_COLUMNS]]

        predictions = [
            tree.predict(features)[0]
            for tree in model.estimators_
        ]

        mean_prediction = float(np.mean(predictions))

        std_prediction = float(np.std(predictions))

        confidence = max(
            60.0,
            min(
                99.0,
                100.0 - (std_prediction * 10.0)
            )
        )

        return (
            round(max(0.0, min(100.0, mean_prediction)), 2),
            round(confidence, 1),
        )

    except Exception as exc:
        raise ModelLoadError(
            f"Unable to generate SOH prediction: {exc}"
        ) from exc