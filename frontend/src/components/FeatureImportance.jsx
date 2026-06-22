import { useEffect, useState } from "react";

export default function FeatureImportance() {
  const [data, setData] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/feature-importance")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="panel">
      <h2>AI Health Drivers</h2>

      {Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([feature, value]) => (
          <div key={feature} style={{ marginBottom: "12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{feature}</span>
              <span>{value}%</span>
            </div>

            <div
              style={{
                width: "100%",
                height: "10px",
                background: "#1e293b",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  width: `${value}%`,
                  height: "100%",
                  background: "#22d3ee",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}