import { useState, useEffect, useRef, useCallback } from 'react';
import Flashcard from './Flashcard.jsx';
import { playNote } from '../utils/audio.js';

const DURATION_MS = { whole: 2000, half: 1000, quarter: 500, eighth: 250, sixteenth: 125 };

export default function SheetPlayer({ notes, onBack }) {
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState(100); // BPM percentage (100 = normal)
  const timerRef = useRef(null);
  const idxRef = useRef(-1);

  const tempoMultiplier = 100 / tempo;

  const stopPlayback = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playNext = useCallback(() => {
    const nextIdx = idxRef.current + 1;
    if (nextIdx >= notes.length) {
      stopPlayback();
      return;
    }

    idxRef.current = nextIdx;
    setCurrentIdx(nextIdx);

    const note = notes[nextIdx];
    if (!note.isRest && note.note) {
      playNote(note.note, (DURATION_MS[note.duration] || 500) * tempoMultiplier / 1000);
    }

    const ms = (DURATION_MS[note.duration] || 500) * tempoMultiplier;
    timerRef.current = setTimeout(playNext, ms);
  }, [notes, tempoMultiplier, stopPlayback]);

  const startPlayback = useCallback(() => {
    idxRef.current = -1;
    setPlaying(true);
    playNext();
  }, [playNext]);

  const resumePlayback = useCallback(() => {
    setPlaying(true);
    playNext();
  }, [playNext]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentNote = notes[currentIdx];
  // Build a display note object compatible with Flashcard
  const displayNote = currentNote && !currentNote.isRest ? {
    id: currentNote.note,
    name: currentNote.note.replace(/[0-9]/g, '').replace('#', '♯').replace('b', '♭'),
    clef: currentNote.clef || 'treble',
    accidental: currentNote.note.includes('#') ? 'sharp' : currentNote.note.includes('b') && currentNote.note !== 'B' ? 'flat' : null,
  } : null;

  return (
    <div className="sheet-player">
      <div className="session-top-bar">
        <button className="btn-home" onClick={() => { stopPlayback(); onBack(); }} title="Back to Home">
          🏠
        </button>
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: '18px' }}>🎶 Sheet Music Player</h2>
      </div>

      <div className="sp-staff-area">
        {displayNote ? (
          <Flashcard
            note={displayNote}
            clef={displayNote.clef}
            revealed={false}
            userAnswer={null}
          />
        ) : (
          <div className="sp-rest-display">
            {currentIdx >= 0 ? '𝄾 Rest' : 'Ready to play'}
          </div>
        )}
      </div>

      <div className="sp-note-info">
        {currentNote && !currentNote.isRest && (
          <span className="sp-current-note">{displayNote?.name} ({currentNote.duration})</span>
        )}
        {currentNote?.isRest && (
          <span className="sp-current-note">Rest ({currentNote.duration})</span>
        )}
        <span className="sp-progress">{Math.max(0, currentIdx + 1)} / {notes.length}</span>
      </div>

      {/* Progress track */}
      <div className="sp-track">
        {notes.map((n, i) => (
          <div
            key={i}
            className={`sp-track-dot ${i === currentIdx ? 'active' : i < currentIdx ? 'played' : ''} ${n.isRest ? 'rest' : ''}`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="sp-controls">
        {!playing && currentIdx < notes.length - 1 && (
          <button className="btn-primary" onClick={currentIdx < 0 ? startPlayback : resumePlayback}>
            {currentIdx < 0 ? '▶ Play' : '▶ Resume'}
          </button>
        )}
        {playing && (
          <button className="btn-secondary" onClick={stopPlayback}>
            ⏸ Pause
          </button>
        )}
        <button className="btn-secondary" onClick={() => { stopPlayback(); idxRef.current = -1; setCurrentIdx(-1); }}>
          ⏮ Restart
        </button>
      </div>

      {/* Tempo slider */}
      <div className="sp-tempo">
        <label>Tempo: {tempo}%</label>
        <input
          type="range"
          min="25"
          max="200"
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
