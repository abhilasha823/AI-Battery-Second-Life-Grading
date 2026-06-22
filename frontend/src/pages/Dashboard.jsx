import { useEffect, useMemo, useState } from "react";
import {
  Battery,
  BatteryCharging,
  Factory,
  Recycle,
  RefreshCw,
  Leaf,
  IndianRupee,
  Clock3,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchBatteries, fetchMetrics } from "../api.js";
import BatteryGauge from "../components/BatteryGauge.jsx";
import MetricCard from "../components/MetricCard.jsx";
import FeatureImportance from "../components/FeatureImportance";

const emptyMetrics = {
  total_batteries: 0,
  average_soh: 0,
  reuse_candidates: 0,
  refurbish_candidates: 0,
  recycling_candidates: 0,
  total_co2_saved: 0,
  total_residual_value: 0,
  average_rul_years: 0,
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [batteries, setBatteries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchMetrics(), fetchBatteries()])
      .then(([metricData, batteryData]) => {
        setMetrics(metricData);
        setBatteries(batteryData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const chartData = useMemo(
    () => [
      { name: "Reuse", value: metrics.reuse_candidates },
      { name: "Refurbish", value: metrics.refurbish_candidates },
      { name: "Recycle", value: metrics.recycling_candidates },
    ],
    [metrics],
  );

  return (
    <div className="stack-lg">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              EV intelligence platform
            </p>
            <h1 className="hero-title">
              AI-Powered Battery Second-Life Grading
            </h1>
            <p className="hero-text">
              Upload EV battery telemetry, estimate state of health, assign a second-life grade,
              and route packs toward reuse, refurbishing, or recycling workflows.
            </p>
            <div className="hero-actions">
              <a
                href="/upload"
                className="button button-primary"
              >
                Upload CSV
              </a>
              <a
                href="/results"
                className="button button-secondary"
              >
                View Results
              </a>
            </div>
          </div>
          <div className="hero-panel">
            <BatteryGauge value={metrics.average_soh} label="Fleet average SOH" />
            <div className="routing-mini-grid">
              <div className="mini-stat mini-stat-green">
                <p className="mini-stat-value">{metrics.reuse_candidates}</p>
                <p className="mini-stat-label">Reuse</p>
              </div>
              <div className="mini-stat mini-stat-amber">
                <p className="mini-stat-value">{metrics.refurbish_candidates}</p>
                <p className="mini-stat-label">Refurbish</p>
              </div>
              <div className="mini-stat mini-stat-rose">
                <p className="mini-stat-value">{metrics.recycling_candidates}</p>
                <p className="mini-stat-label">Recycle</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="alert alert-warning">
          {error}
        </div>
      ) : null}

      <section className="metric-grid">
        <MetricCard
          title="Total Batteries"
          value={metrics.total_batteries}
          caption="Processed through grading API"
          icon={Battery}
          tone="cyan"
        />
        <MetricCard
          title="Average SOH"
          value={`${metrics.average_soh.toFixed(1)}%`}
          caption="Mean state of health"
          icon={BatteryCharging}
          tone="green"
        />
        <MetricCard
          title="Reuse Candidates"
          value={metrics.reuse_candidates}
          caption="Grade A battery packs"
          icon={RefreshCw}
          tone="green"
        />
        <MetricCard
          title="Recycling Candidates"
          value={metrics.recycling_candidates}
          caption="Grade C battery packs"
          icon={Recycle}
          tone="rose"
        />
        <MetricCard
          title="CO₂ Saved"
          value={`${metrics.total_co2_saved} kg`}
          caption="Avoided through battery reuse"
          icon={Leaf}
          tone="green"
        />

       <MetricCard
          title="Residual Value"
          value={`₹${metrics.total_residual_value.toLocaleString()}`}
          caption="Recovered battery value"
          icon={IndianRupee}
          tone="cyan"
       />

       <MetricCard
          title="Avg Remaining Life"
          value={`${metrics.average_rul_years} yrs`}
          caption="Estimated second-life duration"
          icon={Clock3}
          tone="green"
       />
      </section>

        <section className="panel">
         <h2 className="panel-title">
            Environmental & Economic Impact
         </h2>

         <div className="impact-grid">
           <div className="impact-card">
             <h3>Batteries Diverted From Recycling</h3>
             <p className="impact-value">
               {metrics.reuse_candidates + metrics.refurbish_candidates}
             </p>
           </div>
      
           <div className="impact-card">
             <h3>CO₂ Emissions Avoided</h3>
              <p className="impact-value">
                {metrics.total_co2_saved} kg
              </p>
           </div>
      
           <div className="impact-card">
             <h3>Economic Value Recovered</h3>
             <p className="impact-value">
               ₹{metrics.total_residual_value.toLocaleString()}
             </p>
           </div>
         </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Model Validation & Dataset</h2>

        <FeatureImportance />

        <div className="impact-grid">
         <div className="impact-card">
           <h3>Dataset</h3>
           <p className="impact-value">NASA PCoE</p>
           <p className="text-sm text-slate-400 mt-2">
             Real battery degradation cycles
           </p>
         </div>

         <div className="impact-card">
           <h3>Training Samples</h3>
           <p className="impact-value">2,769</p>
           <p className="text-sm text-slate-400 mt-2">
             Extracted discharge cycles
           </p>
         </div>

         <div className="impact-card">
           <h3>ML Model</h3>
           <p className="impact-value">Random Forest</p>
           <p className="text-sm text-slate-400 mt-2">
             SOH regression model
           </p>
         </div>

         <div className="impact-card">
           <h3>Features</h3>
           <p className="impact-value">5</p>
           <p className="text-sm text-slate-400 mt-2">
             Voltage, Current, Temp, Capacity, Cycle Count
           </p>
         </div>

          

         <div className="impact-card">
           <h3>Validation R²</h3>
           <p className="impact-value">0.920</p>
           <p className="text-sm text-slate-400 mt-2">
             Prediction Accuracy
           </p>
         </div>
       </div>


       <div className="mt-6 rounded-xl border border-cyan-500/20 bg-slate-900/40 p-4">
         <p className="text-slate-300">
           State-of-Health predictions are generated using a Random Forest model
           trained on the NASA Prognostics Center of Excellence (PCoE) battery
           aging dataset. The model learns battery degradation patterns from
           real-world charge/discharge cycles and predicts suitability for
           second-life applications.
         </p>
       </div>
     </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <Factory className="icon-cyan" size={20} />
            <h2>Second-Life Routing</h2>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">Recent Battery Health</h2>
          <div className="stack-md">
            {batteries.slice(0, 5).map((battery) => (
              <div key={battery.id} className="battery-list-card">
                <div className="battery-list-header">
                  <span className="battery-id">{battery.battery_id}</span>
                  <span className="status-pill status-pill-cyan">
                    Grade {battery.grade} - {battery.recommendation}
                  </span>
                </div>
                <BatteryGauge value={battery.soh} />
              </div>
            ))}
            {!batteries.length ? (
              <p className="empty-state">
                Upload a CSV to populate live grading results.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
