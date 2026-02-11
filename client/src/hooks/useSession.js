import { useState, useCallback, useRef } from 'react';
import { generateSessionNotes } from '../utils/notes.js';

export default function useSession() {
  const [phase, setPhase] = useState('start'); // start | playing | results
  const [notes, setNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);
  const questionStartTime = useRef(null);
  const sessionStartTime = useRef(null);
  const answersRef = useRef([]);
  const maxStreakRef = useRef(0);
  const totalQuestionsRef = useRef(10);
  const [settings, setSettings] = useState({ includeSharps: false, includeFlats: false, questionCount: 10 });

  const startSession = useCallback((opts = {}) => {
    const merged = {
      includeSharps: opts.includeSharps ?? false,
      includeFlats: opts.includeFlats ?? false,
      questionCount: opts.questionCount || 10,
    };
    setSettings(merged);
    const count = merged.questionCount;
    const generated = generateSessionNotes(count, {
      includeSharps: merged.includeSharps,
      includeFlats: merged.includeFlats,
    });
    totalQuestionsRef.current = count;
    setNotes(generated);
    setCurrentIndex(0);
    setAnswers([]);
    answersRef.current = [];
    setStreak(0);
    setMaxStreak(0);
    maxStreakRef.current = 0;
    setRevealed(false);
    setUserAnswer(null);
    setSessionResult(null);
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
    maxStreakRef.current = newMaxStreak;

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

    const updatedAnswers = [...answersRef.current, answerRecord];
    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);
  }, [notes, currentIndex, revealed, streak, maxStreak]);

  const nextQuestion = useCallback(() => {
    const totalQ = totalQuestionsRef.current;
    if (currentIndex + 1 >= totalQ) {
      // Snapshot final session data and save immediately
      const finalAnswers = answersRef.current;
      const correctCount = finalAnswers.filter(a => a.isCorrect).length;
      const avgTime = finalAnswers.length > 0
        ? Math.round(finalAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0) / finalAnswers.length)
        : 0;

      const result = {
        startedAt: sessionStartTime.current,
        endedAt: new Date().toISOString(),
        totalQuestions: totalQ,
        correctAnswers: correctCount,
        accuracy: Math.round((correctCount / totalQ) * 100),
        avgResponseTimeMs: avgTime,
        streakMax: maxStreakRef.current,
        answers: finalAnswers,
      };

      setSessionResult(result);

      // Save to server immediately
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      }).catch(err => console.error('Failed to save session:', err));

      setPhase('results');
    } else {
      setCurrentIndex(prev => prev + 1);
      setRevealed(false);
      setUserAnswer(null);
      questionStartTime.current = Date.now();
    }
  }, [currentIndex]);

  const currentNote = notes[currentIndex] || null;

  return {
    phase,
    setPhase,
    currentNote,
    currentIndex,
    totalQuestions: totalQuestionsRef.current,
    revealed,
    userAnswer,
    streak,
    maxStreak,
    sessionResult,
    settings,
    startSession,
    submitAnswer,
    nextQuestion,
  };
}
