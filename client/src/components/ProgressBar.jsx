export default function ProgressBar({ current, total }) {
  const pct = ((current) / total) * 100;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-label">{current} / {total}</span>
    </div>
  );
}
