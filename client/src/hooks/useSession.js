import { useState, useCallback, useRef } from 'react';
import { generateSessionNotes } from '../utils/notes.js';

const QUESTIONS_PER_SESSION = 10;

export default function useSession() {
  const [phase, setPhase] = useState('start'); // start | playing | results
  const [notes, setNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const questionStartTime = useRef(null);
  const sessionStartTime = useRef(null);

  const startSession = useCallback(() => {
    const generated = generateSessionNotes(QUESTIONS_PER_SESSION);
    setNotes(generated);
    setCurrentIndex(0);
    setAnswers([]);
    setStreak(0);
    setMaxStreak(0);
    setRevealed(false);
    setUserAnswer(null);
    setPhase('playing');
    sessionStartTime.current = new Date().toISOString();
    questionStartTime.current = Date.now();
  }, []);

  const submitAnswer = useCallback((answer) => {
    if (revealed) return;

    const current = notes[currentIndex];
    const isCorrect = answer === current.name;
    const responseTime = Date.now() - questionStartTime.current;

    const newStreak = isCorrect ? streak + 1 : 0;
    const newMaxStreak = Math.max(maxStreak, newStreak);

    setUserAnswer(answer);
    setRevealed(true);
    setStreak(newStreak);
    setMaxStreak(newMaxStreak);

    const answerRecord = {
      questionNumber: currentIndex + 1,
      clef: current.clef,
      note: current.id,
      correctAnswer: current.name,
      userAnswer: answer,
      isCorrect,
      responseTimeMs: responseTime,
      createdAt: new Date().toISOString(),
    };

    setAnswers(prev => [...prev, answerRecord]);
  }, [notes, currentIndex, revealed, streak, maxStreak]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= QUESTIONS_PER_SESSION) {
      setPhase('results');
    } else {
      setCurrentIndex(prev => prev + 1);
      setRevealed(false);
      setUserAnswer(null);
      questionStartTime.current = Date.now();
    }
  }, [currentIndex]);

  const currentNote = notes[currentIndex] || null;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const avgTime = answers.length > 0
    ? Math.round(answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / answers.length)
    : 0;

  const sessionData = {
    startedAt: sessionStartTime.current,
    endedAt: new Date().toISOString(),
    totalQuestions: QUESTIONS_PER_SESSION,
    correctAnswers: correctCount,
    accuracy: Math.round((correctCount / QUESTIONS_PER_SESSION) * 100),
    avgResponseTimeMs: avgTime,
    streakMax: maxStreak,
    answers,
  };

  return {
    phase,
    setPhase,
    currentNote,
    currentIndex,
    totalQuestions: QUESTIONS_PER_SESSION,
    revealed,
    userAnswer,
    streak,
    maxStreak,
    correctCount,
    avgTime,
    answers,
    sessionData,
    startSession,
    submitAnswer,
    nextQuestion,
  };
}
