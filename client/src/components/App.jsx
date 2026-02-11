import useSession from '../hooks/useSession.js';
import StartScreen from './StartScreen.jsx';
import Flashcard from './Flashcard.jsx';
import AnswerButtons from './AnswerButtons.jsx';
import PianoKeyboard from './PianoKeyboard.jsx';
import ProgressBar from './ProgressBar.jsx';
import Feedback from './Feedback.jsx';
import ResultsScreen from './ResultsScreen.jsx';
import HistoryScreen from './HistoryScreen.jsx';
import NamePrompt from './NamePrompt.jsx';
import PlayNoteButton from './PlayNoteButton.jsx';
import { useState } from 'react';

export default function App() {
  const session = useSession();
  const [showHistory, setShowHistory] = useState(false);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('notequest_name') || '');

  const handleNameSubmit = (name) => {
    localStorage.setItem('notequest_name', name);
    setPlayerName(name);
  };

  if (!playerName) {
    return (
      <div className="app">
        <NamePrompt onSubmit={handleNameSubmit} />
      </div>
    );
  }

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
        <StartScreen onStart={session.startSession} onHistory={() => setShowHistory(true)} playerName={playerName} />
      </div>
    );
  }

  if (session.phase === 'results') {
    return (
      <div className="app">
        <ResultsScreen
          sessionResult={session.sessionResult}
          onRestart={() => session.setPhase('start')}
          onHome={() => session.setPhase('start')}
          playerName={playerName}
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

      <div className="question-actions">
        <div className="question-prompt">What note is this?</div>
        <PlayNoteButton noteId={session.currentNote.id} />
      </div>

      {session.settings?.useKeyboard ? (
        <PianoKeyboard
          onAnswer={session.submitAnswer}
          revealed={session.revealed}
          correctAnswer={session.currentNote?.name}
          userAnswer={session.userAnswer}
          includeSharps={session.settings?.includeSharps}
          includeFlats={session.settings?.includeFlats}
        />
      ) : (
        <AnswerButtons
          onAnswer={session.submitAnswer}
          revealed={session.revealed}
          correctAnswer={session.currentNote?.name}
          userAnswer={session.userAnswer}
          includeSharps={session.settings?.includeSharps}
          includeFlats={session.settings?.includeFlats}
        />
      )}

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
