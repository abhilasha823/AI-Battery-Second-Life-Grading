from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]

METADATA_PATH = ROOT / "archive" / "cleaned_dataset" / "metadata.csv"
DATA_DIR = ROOT / "archive" / "cleaned_dataset" / "data"
OUTPUT_PATH = ROOT / "archive" / "cleaned_dataset" / "nasa_training.csv"

print("Loading metadata...")

metadata = pd.read_csv(METADATA_PATH)

# Convert numeric columns
metadata["Capacity"] = pd.to_numeric(
    metadata["Capacity"],
    errors="coerce",
)

metadata["Re"] = pd.to_numeric(
    metadata["Re"],
    errors="coerce",
)

metadata["Rct"] = pd.to_numeric(
    metadata["Rct"],
    errors="coerce",
)

# Keep only discharge cycles
metadata = metadata[
    metadata["type"] == "discharge"
].copy()

# Remove rows without capacity
metadata = metadata.dropna(subset=["Capacity"])

print(f"Discharge rows found: {len(metadata)}")

rows = []

for battery_id, group in metadata.groupby("battery_id"):

    print(f"Processing battery {battery_id}")

    group = group.sort_values("uid")

    # First discharge cycle capacity = 100% SOH
    initial_capacity = float(
        group.iloc[0]["Capacity"]
    )

    cycle_count = 1

    for _, row in group.iterrows():

        file_name = str(
            row["filename"]
        ).strip()

        file_path = DATA_DIR / file_name

        if not file_path.exists():
            print(f"Missing file: {file_name}")
            continue

        try:
            cycle_df = pd.read_csv(file_path)

            voltage = pd.to_numeric(
                cycle_df["Voltage_measured"],
                errors="coerce",
            ).mean()

            current = pd.to_numeric(
                cycle_df["Current_measured"],
                errors="coerce",
            ).abs().mean()

            temperature = pd.to_numeric(
                cycle_df["Temperature_measured"],
                errors="coerce",
            ).mean()

            capacity = float(
                row["Capacity"]
            )

            soh = (
                capacity
                / initial_capacity
            ) * 100

            rows.append(
                {
                    "voltage": round(
                        voltage,
                        4,
                    ),
                    "current": round(
                        current,
                        4,
                    ),
                    "temperature": round(
                        temperature,
                        4,
                    ),
                    "cycle_count": cycle_count,
                    "capacity": round(
                        capacity,
                        4,
                    ),
                    "soh": round(
                        soh,
                        2,
                    ),
                }
            )

            cycle_count += 1

        except Exception as exc:
            print(
                f"Skipped {file_name}: {exc}"
            )

training_df = pd.DataFrame(rows)

training_df.to_csv(
    OUTPUT_PATH,
    index=False,
)

print("\n==============================")
print("NASA training dataset created")
print("==============================")
print(f"Rows: {len(training_df)}")
print(f"Saved to: {OUTPUT_PATH}")

print("\nSample:")
print(training_df.head())