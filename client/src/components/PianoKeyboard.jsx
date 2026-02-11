import { playNote } from '../utils/audio.js';

// One octave pattern: which keys are white, which are black
// We'll render C3-B4 (2 octaves) for bass, C4-B5 for treble
const OCTAVE_PATTERN = [
  { note: 'C', type: 'white' },
  { note: 'C♯', type: 'black', offset: 0.55 },
  { note: 'D', type: 'white' },
  { note: 'E♭', type: 'black', offset: 1.7 },
  { note: 'E', type: 'white' },
  { note: 'F', type: 'white' },
  { note: 'F♯', type: 'black', offset: 3.55 },
  { note: 'G', type: 'white' },
  { note: 'A♭', type: 'black', offset: 4.65 },
  { note: 'A', type: 'white' },
  { note: 'B♭', type: 'black', offset: 5.8 },
  { note: 'B', type: 'white' },
];

function buildKeys(startOctave, endOctave, includeSharps, includeFlats) {
  const keys = [];
  let whiteIndex = 0;

  for (let oct = startOctave; oct <= endOctave; oct++) {
    for (const k of OCTAVE_PATTERN) {
      // Skip accidentals if not enabled
      if (k.type === 'black') {
        const isSharp = k.note.includes('♯');
        const isFlat = k.note.includes('♭');
        if (isSharp && !includeSharps) continue;
        if (isFlat && !includeFlats) continue;
      }

      // Build note ID for audio playback (e.g. 'C#4', 'Eb4')
      const noteIdBase = k.note.replace('♯', '#').replace('♭', 'b');
      const noteId = `${noteIdBase}${oct}`;

      keys.push({
        name: k.note,       // Display name: 'C', 'C♯', 'E♭'
        noteId,             // Audio ID: 'C4', 'C#4', 'Eb4'
        type: k.type,
        octave: oct,
        whiteIndex: k.type === 'white' ? whiteIndex : null,
        blackOffset: k.type === 'black' ? k.offset + (oct - startOctave) * 7 : null,
      });

      if (k.type === 'white') whiteIndex++;
    }
  }

  return { keys, totalWhite: whiteIndex };
}

export default function PianoKeyboard({ onAnswer, revealed, correctAnswer, userAnswer, includeSharps, includeFlats }) {
  // 2 octaves: C4-B5 covers treble, C3-B4 covers bass range overlap
  const { keys, totalWhite } = buildKeys(3, 5, includeSharps, includeFlats);

  const whiteWidth = 100 / totalWhite;

  const handleClick = (key) => {
    if (revealed) return;
    playNote(key.noteId);
    onAnswer(key.name);
  };

  const whiteKeys = keys.filter(k => k.type === 'white');
  const blackKeys = keys.filter(k => k.type === 'black');

  const getKeyClass = (key) => {
    let cls = key.type === 'white' ? 'piano-key white' : 'piano-key black';
    if (revealed) {
      if (key.name === correctAnswer) cls += ' correct';
      else if (key.name === userAnswer && key.name !== correctAnswer) cls += ' incorrect';
      else cls += ' dimmed';
    }
    return cls;
  };

  return (
    <div className="piano-keyboard" style={{ '--total-white': totalWhite }}>
      {/* White keys */}
      {whiteKeys.map((key, i) => (
        <button
          key={`${key.noteId}`}
          className={getKeyClass(key)}
          style={{ left: `${i * whiteWidth}%`, width: `${whiteWidth}%` }}
          onClick={() => handleClick(key)}
          disabled={revealed}
        >
          <span className="piano-key-label">{key.name}</span>
        </button>
      ))}
      {/* Black keys */}
      {blackKeys.map((key) => (
        <button
          key={`${key.noteId}`}
          className={getKeyClass(key)}
          style={{ left: `${key.blackOffset * whiteWidth}%`, width: `${whiteWidth * 0.6}%` }}
          onClick={() => handleClick(key)}
          disabled={revealed}
        />
      ))}
    </div>
  );
}
