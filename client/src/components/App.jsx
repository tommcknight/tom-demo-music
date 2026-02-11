import useSession from '../hooks/useSession.js';
import StartScreen from './StartScreen.jsx';
import Flashcard from './Flashcard.jsx';
import AnswerButtons from './AnswerButtons.jsx';
import ProgressBar from './ProgressBar.jsx';
import Feedback from './Feedback.jsx';
import ResultsScreen from './ResultsScreen.jsx';
import HistoryScreen from './HistoryScreen.jsx';
import { useState } from 'react';

export default function App() {
  const session = useSession();
  const [showHistory, setShowHistory] = useState(false);

  if (showHistory) {
    return (
      <div className="app">
        <HistoryScreen onBack={() => setShowHistory(false)} />
      </div>
    );
  }

  if (session.phase === 'start') {
    return (
      <div className="app">
        <StartScreen onStart={session.startSession} onHistory={() => setShowHistory(true)} />
      </div>
    );
  }

  if (session.phase === 'results') {
    return (
      <div className="app">
        <ResultsScreen
          sessionData={session.sessionData}
          onRestart={session.startSession}
          onHome={() => session.setPhase('start')}
        />
      </div>
    );
  }

  // Playing phase
  return (
    <div className="app">
      <ProgressBar current={session.currentIndex + 1} total={session.totalQuestions} />

      <div className="clef-label">{session.currentNote.clef === 'treble' ? '𝄞 Treble' : '𝄢 Bass'} Clef</div>

      <Flashcard
        note={session.currentNote}
        clef={session.currentNote.clef}
        revealed={session.revealed}
        userAnswer={session.userAnswer}
      />

      <div className="question-prompt">What note is this?</div>

      <AnswerButtons
        onAnswer={session.submitAnswer}
        revealed={session.revealed}
        correctAnswer={session.currentNote?.name}
        userAnswer={session.userAnswer}
      />

      {session.revealed && (
        <Feedback
          isCorrect={session.userAnswer === session.currentNote.name}
          correctAnswer={session.currentNote.name}
          streak={session.streak}
          onNext={session.nextQuestion}
        />
      )}
    </div>
  );
}
