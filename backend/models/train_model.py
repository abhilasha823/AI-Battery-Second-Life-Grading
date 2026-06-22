import argparse
import csv
from pathlib import Path
from random import Random

import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


FEATURE_COLUMNS = ["voltage", "current", "temperature", "cycle_count", "capacity"]
TARGET_COLUMN = "soh"
MODEL_PATH = Path(__file__).resolve().parent / "soh_model.pkl"


def synthetic_training_rows(count: int = 600) -> list[dict[str, float]]:
    rng = Random(42)
    rows = []

    for _ in range(count):
        cycle_count = rng.randint(80, 2400)
        temperature = rng.uniform(22, 48)
        current = rng.uniform(18, 75)
        capacity = rng.uniform(45, 100)
        voltage = rng.uniform(320, 410)

        age_penalty = cycle_count * 0.008
        heat_penalty = max(0, temperature - 30) * 0.45
        stress_penalty = max(0, current - 45) * 0.06
        voltage_bonus = (voltage - 360) * 0.025
        noise = rng.uniform(-2.0, 2.0)
        soh = capacity - age_penalty - heat_penalty - stress_penalty + voltage_bonus + noise
        soh = round(max(35.0, min(100.0, soh)), 2)

        rows.append(
            {
                "voltage": round(voltage, 2),
                "current": round(current, 2),
                "temperature": round(temperature, 2),
                "cycle_count": float(cycle_count),
                "capacity": round(capacity, 2),
                "soh": soh,
            }
        )

    return rows


def load_csv_rows(path: Path) -> list[dict[str, float]]:
    with path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        if not reader.fieldnames:
            raise ValueError("Training CSV is empty.")

        missing = set(FEATURE_COLUMNS + [TARGET_COLUMN]).difference(reader.fieldnames)
        if missing:
            raise ValueError(f"Training CSV is missing columns: {', '.join(sorted(missing))}")

        rows = []
        for line_number, row in enumerate(reader, start=2):
            try:
                rows.append(
                    {
                        **{feature: float(row[feature]) for feature in FEATURE_COLUMNS},
                        TARGET_COLUMN: float(row[TARGET_COLUMN]),
                    }
                )
            except (TypeError, ValueError) as exc:
                raise ValueError(f"Invalid numeric value on row {line_number}.") from exc

    if len(rows) < 10:
        raise ValueError("Training requires at least 10 rows.")

    return rows


def train(rows: list[dict[str, float]]) -> RandomForestRegressor:
    features = [[row[column] for column in FEATURE_COLUMNS] for row in rows]
    target = [row[TARGET_COLUMN] for row in rows]

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=0.2,
        random_state=42,
    )

    model = RandomForestRegressor(
        n_estimators=250,
        random_state=42,
        min_samples_leaf=2,
        n_jobs=-1,
    )
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    print(f"Validation MAE: {mean_absolute_error(y_test, predictions):.2f}")
    print(f"Validation R2: {r2_score(y_test, predictions):.3f}")

    return model


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the EV battery SOH RandomForest model.")
    parser.add_argument(
        "--data",
        type=Path,
        help="Optional CSV path with voltage,current,temperature,cycle_count,capacity,soh columns.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=MODEL_PATH,
        help="Output path for the trained model pickle.",
    )
    args = parser.parse_args()

    rows = load_csv_rows(args.data) if args.data else synthetic_training_rows()
    print(f"Training rows loaded: {len(rows)}")
    model = train(rows)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": model,
            "features": FEATURE_COLUMNS,
            "target": TARGET_COLUMN,
        },
        args.output,
    )
    print(f"Saved trained model to {args.output}")


if __name__ == "__main__":
    main()
