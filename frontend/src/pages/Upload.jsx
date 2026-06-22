import { useState } from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { uploadBatteryCsv } from "../api.js";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [count, setCount] = useState(0);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a CSV file before running predictions.");
      return;
    }

    setIsUploading(true);

    try {
      const results = await uploadBatteryCsv(file);

      localStorage.setItem(
        "latestBatteryResults",
        JSON.stringify(results)
      );

      setCount(results.length);

      setTimeout(() => navigate("/results"), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function loadDemoDataset() {
    setError("");
    setIsUploading(true);

    try {
      const response = await fetch("/demo_judge_dataset.csv");

      const blob = await response.blob();

      const demoFile = new File(
        [blob],
        "demo_judge_dataset.csv",
        {
          type: "text/csv",
        }
      );

      const results = await uploadBatteryCsv(demoFile);

      localStorage.setItem(
        "latestBatteryResults",
        JSON.stringify(results)
      );

      setCount(results.length);

      setTimeout(() => navigate("/results"), 700);
    } catch (err) {
      console.error(err);
      setError("Failed to load demo dataset.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="narrow-page stack-md">
      <section>
        <p className="eyebrow">
          CSV ingestion
        </p>

        <h1 className="page-title">
          Battery Upload
        </h1>

        <p className="page-copy">
          Upload battery telemetry with battery ID, voltage,
          current, temperature, cycle count, and capacity.
          The API estimates SOH and returns a grade with a
          second-life recommendation.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="upload-card"
      >
        <label
          htmlFor="csv"
          className="dropzone"
        >
          <UploadCloud
            className="dropzone-icon"
            size={42}
          />

          <span className="dropzone-title">
            {file
              ? file.name
              : "Drop in a battery CSV file"}
          </span>

          <span className="dropzone-help">
            Required fields:
            battery_id, voltage, current,
            temperature, cycle_count, capacity
          </span>

          <input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            className="visually-hidden"
            onChange={(event) =>
              setFile(
                event.target.files?.[0] || null
              )
            }
          />
        </label>

        <div className="example-card">
          <div className="inline-info">
            <FileSpreadsheet
              size={18}
              className="icon-green"
            />
            Example row:
            BAT-001, 384.5, 42.1, 31.8, 680, 91.4
          </div>
        </div>

        {error ? (
          <div className="alert alert-error">
            {error}
          </div>
        ) : null}

        {count > 0 ? (
          <div className="alert alert-success inline-info">
            <CheckCircle2 size={18} />
            Processed {count} battery records.
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            disabled={isUploading}
            className="button button-primary upload-button"
          >
            {isUploading ? (
              <Loader2
                className="spin"
                size={18}
              />
            ) : (
              <UploadCloud size={18} />
            )}

            {isUploading
              ? "Running Predictions"
              : "Upload and Predict"}
          </button>

          <button
            type="button"
            onClick={loadDemoDataset}
            disabled={isUploading}
            className="button"
          >
            Load Demo Dataset
          </button>

          <a
            href="/demo_judge_dataset.csv"
            download
            className="button"
          >
            ⬇ Download Sample CSV
          </a>
        </div>
      </form>
    </div>
  );
}