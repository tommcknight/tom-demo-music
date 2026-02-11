import { playNote } from '../utils/audio.js';

export default function PlayNoteButton({ noteId }) {
  return (
    <button
      className="btn-play-note"
      onClick={() => playNote(noteId)}
      title="Hear this note"
      aria-label="Play note sound"
    >
      🔊
    </button>
  );
}
