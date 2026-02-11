import { useState, useEffect } from 'react';
import Confetti from './Confetti.jsx';

export default function ResultsScreen({ sessionData, onRestart, onHome }) {
  const [encouragement, setEncouragement] = useState(null);
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    // Save session to server
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    })
      .then(() => setSaving(false))
      .catch(() => setSaving(false));

    // Get AI encouragement
    fetch('/api/encouragement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accuracy: sessionData.accuracy,
        correctAnswers: sessionData.correctAnswers,
        totalQuestions: sessionData.totalQuestions,
        avgResponseTimeMs: sessionData.avgResponseTimeMs,
        streakMax: sessionData.streakMax,
      }),
    })
      .then(r => r.json())
      .then(data => setEncouragement(data.message))
      .catch(() => setEncouragement(null));
  }, []);

  const { accuracy, correctAnswers, totalQuestions, avgResponseTimeMs, streakMax } = sessionData;

  const emoji = accuracy === 100 ? '🏆' : accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪';
  const grade = accuracy === 100 ? 'PERFECT!' : accuracy >= 80 ? 'Great job!' : accuracy >= 60 ? 'Good effort!' : 'Keep practicing!';

  return (
    <div className="results-screen">
      <Confetti show={accuracy === 100} />
      <div className="results-emoji">{emoji}</div>
      <h2>{grade}</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{correctAnswers}/{totalQuestions}</div>
          <div className="stat-label">Correct</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(avgResponseTimeMs / 1000).toFixed(1)}s</div>
          <div className="stat-label">Avg Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🔥 {streakMax}</div>
          <div className="stat-label">Best Streak</div>
        </div>
      </div>

      {encouragement && (
        <div className="ai-encouragement">
          <div className="ai-label">✨ Coach says:</div>
          <p>{encouragement}</p>
        </div>
      )}

      {saving && <p className="saving-text">Saving...</p>}

      <div className="results-actions">
        <button className="btn-primary" onClick={onRestart}>Play Again! 🎵</button>
        <button className="btn-secondary" onClick={onHome}>Home</button>
      </div>
    </div>
  );
}
