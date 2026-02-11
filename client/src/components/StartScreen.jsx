export default function StartScreen({ onStart, onHistory, playerName }) {
  return (
    <div className="start-screen">
      <div className="logo">🎵</div>
      <h1>Note Quest</h1>
      <p className="subtitle">Hey {playerName}! Ready to practice? 🎹</p>

      <div className="start-info">
        <div className="info-item">📋 10 notes</div>
        <div className="info-item">🎼 Treble & Bass clef</div>
        <div className="info-item">⏱️ Timed responses</div>
      </div>

      <button className="btn-primary" onClick={onStart}>
        Start Practice! 🚀
      </button>

      <button className="btn-secondary" onClick={onHistory}>
        📊 View History
      </button>
    </div>
  );
}
