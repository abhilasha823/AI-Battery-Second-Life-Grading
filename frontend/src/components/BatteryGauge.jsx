export default function BatteryGauge({ value = 0, label = "SOH" }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const color =
    clamped > 80 ? "gauge-fill-green" : clamped >= 60 ? "gauge-fill-amber" : "gauge-fill-rose";

  return (
    <div className="battery-gauge">
      <div className="gauge-header">
        <span className="gauge-label">{label}</span>
        <span className="gauge-value">{clamped.toFixed(1)}%</span>
      </div>
      <div className="battery-shell">
        <div
          className={`gauge-fill ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

