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
import SheetUploadScreen from './SheetUploadScreen.jsx';
import SheetPlayer from './SheetPlayer.jsx';
import { useState } from 'react';

export default function App() {
  const session = useSession();
  const [showHistory, setShowHistory] = useState(false);
  const [showSheetUpload, setShowSheetUpload] = useState(false);
  const [sheetNotes, setSheetNotes] = useState(null);
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

  if (sheetNotes) {
    return (
      <div className="app">
        <SheetPlayer sheetData={sheetNotes} onBack={() => setSheetNotes(null)} />
      </div>
    );
  }

  if (showSheetUpload) {
    return (
      <div className="app">
        <SheetUploadScreen
          onTranscribed={(notes) => { setSheetNotes(notes); setShowSheetUpload(false); }}
          onBack={() => setShowSheetUpload(false)}
        />
      </div>
    );
  }

  if (session.phase === 'start') {
    return (
      <div className="app">
        <StartScreen
          onStart={session.startSession}
          onHistory={() => setShowHistory(true)}
          onSheetMusic={() => setShowSheetUpload(true)}
          playerName={playerName}
        />
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
      <div className="session-top-bar">
        <button className="btn-home" onClick={() => session.setPhase('start')} title="Back to Home">
          🏠
        </button>
        <ProgressBar current={session.currentIndex + 1} total={session.totalQuestions} />
      </div>

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
          currentNoteId={session.currentNote?.id}
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
