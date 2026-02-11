import { useEffect, useState } from 'react';

const CORRECT_MESSAGES = ['Amazing! 🎉', 'Perfect! ⭐', 'You rock! 🎸', 'Nailed it! 💪', 'Superstar! 🌟'];
const INCORRECT_MESSAGES = ['Not quite! 🤔', 'Almost! 💪', 'Keep trying! 🎯', "You'll get it! ✨"];

export default function Feedback({ isCorrect, correctAnswer, streak, onNext }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const message = isCorrect
    ? CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]
    : INCORRECT_MESSAGES[Math.floor(Math.random() * INCORRECT_MESSAGES.length)];

  return (
    <div className={`feedback ${show ? 'show' : ''} ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="feedback-message">{message}</div>
      {!isCorrect && (
        <div className="feedback-answer">The answer was <strong>{correctAnswer}</strong></div>
      )}
      {isCorrect && streak >= 3 && (
        <div className="streak-badge">🔥 {streak} streak!</div>
      )}
      <button className="btn-next" onClick={onNext}>
        Next →
      </button>
    </div>
  );
}
