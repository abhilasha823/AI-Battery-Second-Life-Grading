export default function MetricCard({ title, value, caption, icon: Icon, tone = "cyan" }) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <div className="metric-card-inner">
        <div>
          <p className="metric-title">{title}</p>
          <p className="metric-value">{value}</p>
          <p className="metric-caption">{caption}</p>
        </div>
        {Icon ? (
          <div className="metric-icon">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </article>
  );
}