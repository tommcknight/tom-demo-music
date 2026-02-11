import { ALL_NOTE_NAMES } from '../utils/notes.js';

export default function AnswerButtons({ onAnswer, revealed, correctAnswer, userAnswer }) {
  return (
    <div className="answer-buttons">
      {ALL_NOTE_NAMES.map(note => {
        let className = 'btn-note';
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
