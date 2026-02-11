// Note definitions for treble and bass clef
// Each note has: id (e.g. 'C4'), name (letter), octave, clef

export const TREBLE_NOTES = [
  { id: 'C4', name: 'C', octave: 4, ledgerLines: 1 },  // Middle C - 1 ledger line below
  { id: 'D4', name: 'D', octave: 4, ledgerLines: 0 },
  { id: 'E4', name: 'E', octave: 4, ledgerLines: 0 },
  { id: 'F4', name: 'F', octave: 4, ledgerLines: 0 },
  { id: 'G4', name: 'G', octave: 4, ledgerLines: 0 },
  { id: 'A4', name: 'A', octave: 4, ledgerLines: 0 },
  { id: 'B4', name: 'B', octave: 4, ledgerLines: 0 },
  { id: 'C5', name: 'C', octave: 5, ledgerLines: 0 },
  { id: 'D5', name: 'D', octave: 5, ledgerLines: 0 },
  { id: 'E5', name: 'E', octave: 5, ledgerLines: 0 },
  { id: 'F5', name: 'F', octave: 5, ledgerLines: 0 },
  { id: 'G5', name: 'G', octave: 5, ledgerLines: 0 },
  { id: 'A5', name: 'A', octave: 5, ledgerLines: 1 },  // 1 ledger line above
];

export const BASS_NOTES = [
  { id: 'E2', name: 'E', octave: 2, ledgerLines: 1 },  // 1 ledger line below
  { id: 'F2', name: 'F', octave: 2, ledgerLines: 0 },
  { id: 'G2', name: 'G', octave: 2, ledgerLines: 0 },
  { id: 'A2', name: 'A', octave: 2, ledgerLines: 0 },
  { id: 'B2', name: 'B', octave: 2, ledgerLines: 0 },
  { id: 'C3', name: 'C', octave: 3, ledgerLines: 0 },
  { id: 'D3', name: 'D', octave: 3, ledgerLines: 0 },
  { id: 'E3', name: 'E', octave: 3, ledgerLines: 0 },
  { id: 'F3', name: 'F', octave: 3, ledgerLines: 0 },
  { id: 'G3', name: 'G', octave: 3, ledgerLines: 0 },
  { id: 'A3', name: 'A', octave: 3, ledgerLines: 0 },
  { id: 'B3', name: 'B', octave: 3, ledgerLines: 0 },
  { id: 'C4', name: 'C', octave: 4, ledgerLines: 1 },  // Middle C - 1 ledger line above
];

export const ALL_NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function generateSessionNotes(count = 10) {
  const notes = [];
  for (let i = 0; i < count; i++) {
    const clef = Math.random() < 0.5 ? 'treble' : 'bass';
    const pool = clef === 'treble' ? TREBLE_NOTES : BASS_NOTES;
    const note = pool[Math.floor(Math.random() * pool.length)];
    notes.push({ ...note, clef });
  }
  return notes;
}
