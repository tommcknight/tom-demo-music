import { useState } from 'react';

export default function StartScreen({ onStart, onHistory, playerName }) {
  const [includeSharps, setIncludeSharps] = useState(() => localStorage.getItem('nq_sharps') === 'true');
  const [includeFlats, setIncludeFlats] = useState(() => localStorage.getItem('nq_flats') === 'true');
  const [questionCount, setQuestionCount] = useState(() => Number(localStorage.getItem('nq_count')) || 10);
  const [useKeyboard, setUseKeyboard] = useState(() => localStorage.getItem('nq_keyboard') === 'true');

  const handleStart = () => {
    localStorage.setItem('nq_sharps', includeSharps);
    localStorage.setItem('nq_flats', includeFlats);
    localStorage.setItem('nq_count', questionCount);
    localStorage.setItem('nq_keyboard', useKeyboard);
    onStart({ includeSharps, includeFlats, questionCount, useKeyboard });
  };

  return (
    <div className="start-screen">
      <div className="logo">🎵</div>
      <h1>Note Quest</h1>
      <p className="subtitle">Hey {playerName}! Ready to practice? 🎹</p>

      <div className="settings-card">
        <h3>Session Settings</h3>

        <div className="setting-row">
          <label>Questions</label>
          <div className="count-picker">
            {[5, 10, 15, 20].map(n => (
              <button
                key={n}
                className={`btn-count ${questionCount === n ? 'active' : ''}`}
                onClick={() => setQuestionCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <label>Include Sharps (♯)</label>
          <div className={`toggle-switch ${includeSharps ? 'on' : ''}`} onClick={() => setIncludeSharps(!includeSharps)}>
            <div className="toggle-knob" />
          </div>
        </div>

        <div className="setting-row">
          <label>Include Flats (♭)</label>
          <div className={`toggle-switch ${includeFlats ? 'on' : ''}`} onClick={() => setIncludeFlats(!includeFlats)}>
            <div className="toggle-knob" />
          </div>
        </div>

        <div className="setting-row">
          <label>Piano Keys</label>
          <div className={`toggle-switch ${useKeyboard ? 'on' : ''}`} onClick={() => setUseKeyboard(!useKeyboard)}>
            <div className="toggle-knob" />
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={handleStart}>
        Start Practice! 🚀
      </button>

      <button className="btn-secondary" onClick={onHistory}>
        📊 View History
      </button>
    </div>
  );
}
