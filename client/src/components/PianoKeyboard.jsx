import { playNote } from '../utils/audio.js';

// Real piano layout: black keys sit between specific white keys
// Each black key is positioned as a percentage offset from the left edge
// of the white key group it sits between.
//
// In one octave of 7 white keys (C D E F G A B):
//   C#/Db sits between C and D
//   D#/Eb sits between D and E
//   F#/Gb sits between F and G
//   G#/Ab sits between G and A
//   A#/Bb sits between A and B
//
// Black key centers (in white-key units from left):
//   C#: 0.6,  Eb: 1.75,  F#: 3.55,  Ab: 4.6,  Bb: 5.7

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const BLACK_NOTES = [
  { note: 'C♯', sharpOf: 'C', position: 0.6 },
  { note: 'E♭', flatOf: 'E',  position: 1.75 },
  { note: 'F♯', sharpOf: 'F', position: 3.55 },
  { note: 'A♭', flatOf: 'A',  position: 4.6 },
  { note: 'B♭', flatOf: 'B',  position: 5.7 },
];

function buildKeys(startOctave, endOctave, includeSharps, includeFlats) {
  const whites = [];
  const blacks = [];
  let whiteIdx = 0;
  const octaveCount = endOctave - startOctave + 1;

  for (let oct = startOctave; oct <= endOctave; oct++) {
    const octOffset = (oct - startOctave) * 7;

    for (const note of WHITE_NOTES) {
      const noteId = `${note}${oct}`;
      whites.push({ name: note, noteId, whiteIdx, type: 'white' });
      whiteIdx++;
    }

    for (const bk of BLACK_NOTES) {
      const isSharp = bk.note.includes('♯');
      const isFlat = bk.note.includes('♭');
      const enabled = (isSharp && includeSharps) || (isFlat && includeFlats);

      const noteIdBase = bk.note.replace('♯', '#').replace('♭', 'b');
      const noteId = `${noteIdBase}${oct}`;
      blacks.push({
        name: bk.note,
        noteId,
        type: 'black',
        pos: octOffset + bk.position,
        enabled,
      });
    }
  }

  return { whites, blacks, totalWhite: whiteIdx };
}

export default function PianoKeyboard({ onAnswer, revealed, correctAnswer, userAnswer, includeSharps, includeFlats, currentNoteId }) {
  const { whites, blacks, totalWhite } = buildKeys(3, 5, includeSharps, includeFlats);
  const whiteW = 100 / totalWhite;
  const blackW = whiteW * 0.58;

  const handleClick = (key) => {
    if (revealed || key.enabled === false) return;
    // Play the actual note's pitch (correct octave), not the piano key's octave
    playNote(currentNoteId);
    onAnswer(key.name);
  };

  const getKeyClass = (key) => {
    let cls = `pk pk-${key.type}`;
    if (revealed) {
      if (key.name === correctAnswer) cls += ' pk-correct';
      else if (key.name === userAnswer && key.name !== correctAnswer) cls += ' pk-wrong';
      else cls += ' pk-dim';
    }
    return cls;
  };

  return (
    <div className="piano-wrap">
      <div className="piano" style={{ '--wk-w': `${whiteW}%`, '--bk-w': `${blackW}%` }}>
        {whites.map((k) => (
          <button
            key={k.noteId}
            className={getKeyClass(k)}
            style={{ left: `${k.whiteIdx * whiteW}%`, width: `${whiteW}%` }}
            onClick={() => handleClick(k)}
            disabled={revealed}
          >
            <span className="pk-label">{k.name}</span>
          </button>
        ))}
        {blacks.map((k) => (
          <button
            key={k.noteId}
            className={`${getKeyClass(k)}${!k.enabled ? ' pk-inert' : ''}`}
            style={{ left: `${k.pos * whiteW - blackW / 2}%`, width: `${blackW}%` }}
            onClick={() => handleClick(k)}
            disabled={revealed || !k.enabled}
          />
        ))}
      </div>
    </div>
  );
}
