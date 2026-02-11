import { ALL_NOTE_NAMES } from '../utils/notes.js';

export default function AnswerButtons({ onAnswer, revealed, correctAnswer, userAnswer, includeSharps, includeFlats }) {
  const visibleNotes = ALL_NOTE_NAMES.filter(note => {
    if (note.includes('♯')) return includeSharps;
    if (note.includes('♭')) return includeFlats;
    return true;
  });

  return (
    <div className="answer-buttons">
      {visibleNotes.map(note => {
        let className = 'btn-note';
        const hasAccidental = note.includes('♯') || note.includes('♭');
        if (hasAccidental) className += ' accidental';
        if (revealed) {
          if (note === correctAnswer) className += ' correct';
          else if (note === userAnswer) className += ' incorrect';
          else className += ' dimmed';
        }
        return (
          <button
            key={note}
            className={className}
            onClick={() => onAnswer(note)}
            disabled={revealed}
          >
            {note}
          </button>
        );
      })}
    </div>
  );
}
