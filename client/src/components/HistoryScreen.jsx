import { useState, useEffect } from 'react';

export default function HistoryScreen({ onBack }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  return (
    <div className="history-screen">
      <div className="history-header">
        <button className="btn-back" onClick={onBack}>←</button>
        <h2>📊 Session History</h2>
      </div>

      {loading && <p className="history-empty">Loading...</p>}

      {!loading && sessions.length === 0 && (
        <p className="history-empty">No sessions yet! Play a round to get started 🎵</p>
      )}

      {sessions.map(s => (
        <div key={s.id} className="session-card">
          <div>
            <div className="session-date">{formatDate(s.started_at)}</div>
            <div className="session-detail">
              {s.correct_answers}/{s.total_questions} correct · {(s.avg_response_time_ms / 1000).toFixed(1)}s avg · 🔥{s.streak_max}
            </div>
          </div>
          <div className="session-accuracy">{Math.round(s.accuracy)}%</div>
        </div>
      ))}
    </div>
  );
}
