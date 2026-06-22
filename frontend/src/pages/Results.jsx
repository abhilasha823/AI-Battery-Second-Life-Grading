import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { fetchBatteries } from "../api.js";
import BatteryGauge from "../components/BatteryGauge.jsx";

const gradeClasses = {
  A: "grade-a",
  B: "grade-b",
  C: "grade-c",
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadResults() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBatteries();
      setResults(data);
    } catch (err) {
      const localResults = JSON.parse(localStorage.getItem("latestBatteryResults") || "[]");
      setResults(localResults);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  return (
    <div className="stack-md">
      <section className="page-header-row">
        <div>
          <p className="eyebrow">
            Grading output
          </p>
          <h1 className="page-title">Results</h1>
          <p className="page-copy">
            Battery IDs, SOH scores, grades, and second-life recommendations.
          </p>
        </div>
        <button
          onClick={loadResults}
          className="button button-secondary"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      {error ? (
        <div className="alert alert-warning">
          Showing locally cached upload results because the API could not be reached: {error}
        </div>
      ) : null}

      <section className="table-card">
        <div className="table-scroll">
          <table className="results-table">
            <thead>
              <tr>
                <th>
                  Battery ID
                </th>
                <th>
                  SOH Score
                </th>
                <th>
                  Grade
                </th>
                <th>
                  Recommendation
                </th>
                <th>
                  Risk Alert
                </th>
                <th>
                  Passport
                </th>
              </tr>
            </thead>
            <tbody>
              {results
                .filter((battery) => battery.battery_id !== "NASA-46")
                .map((battery) => (
                <tr key={battery.id || battery.battery_id}>
                  <td className="nowrap strong-cell">
                    {battery.battery_id}
                  </td>
                  <td className="soh-cell">
                    <BatteryGauge value={battery.soh} />
                  </td>
                  <td className="nowrap">
                    <span
                      className={`grade-pill ${
                        gradeClasses[battery.grade]
                      }`}
                    >
                      Grade {battery.grade}
                    </span>
                  </td>
                  <td className="nowrap recommendation-cell">
                    {battery.recommendation}
                  </td>

                  <td>
                    {battery.risk_level === "HIGH" && (
                      <span
                        style={{
                        background: "#7f1d1d",
                        color: "#fca5a5",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      🔴 HIGH RISK
                    </span>
                  )}

                  {battery.risk_level === "MEDIUM" && (
                    <span
                      style={{
                       background: "#78350f",
                       color: "#fcd34d",
                       padding: "6px 10px",
                       borderRadius: "8px",
                       fontWeight: "bold",
                      }}
                    >
                      🟡 MEDIUM RISK
                    </span>
                  )}

                  {battery.risk_level === "LOW" && (
                    <span
                      style={{
                        background: "#14532d",
                        color: "#86efac",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      🟢 LOW RISK
                    </span>
                  )}

                  {battery.risk_alerts?.length > 0 && (
                    <div
                     style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#cbd5e1",
                      }}
                    >
                      {battery.risk_alerts[0]}
                    </div>
                  )}

                </td>

                  <td className="nowrap">
                    <Link
                      to={`/passport/${battery.battery_id}`}
                      className="button button-secondary"
                      >
                        View Passport
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !results.length ? (
          <div className="table-message">
            No results yet. Upload a CSV file to generate battery grades.
          </div>
        ) : null}
        {loading ? <div className="table-message">Loading results...</div> : null}
      </section>
    </div>
  );
}
