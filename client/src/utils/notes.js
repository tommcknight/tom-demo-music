// Note definitions for treble and bass clef
// Each note has: id (e.g. 'C4'), name (display name), octave, clef
// Sharps/flats share the same staff position as their natural neighbor
// accidental: 'sharp' | 'flat' | null

export const TREBLE_NOTES = [
  { id: 'C4', name: 'C', octave: 4, ledgerLines: 1, accidental: null },
  { id: 'C#4', name: 'C♯', octave: 4, ledgerLines: 1, accidental: 'sharp', baseNote: 'C4' },
  { id: 'D4', name: 'D', octave: 4, ledgerLines: 0, accidental: null },
  { id: 'Eb4', name: 'E♭', octave: 4, ledgerLines: 0, accidental: 'flat', baseNote: 'E4' },
  { id: 'E4', name: 'E', octave: 4, ledgerLines: 0, accidental: null },
  { id: 'F4', name: 'F', octave: 4, ledgerLines: 0, accidental: null },
  { id: 'F#4', name: 'F♯', octave: 4, ledgerLines: 0, accidental: 'sharp', baseNote: 'F4' },
  { id: 'G4', name: 'G', octave: 4, ledgerLines: 0, accidental: null },
  { id: 'Ab4', name: 'A♭', octave: 4, ledgerLines: 0, accidental: 'flat', baseNote: 'A4' },
  { id: 'A4', name: 'A', octave: 4, ledgerLines: 0, accidental: null },
  { id: 'Bb4', name: 'B♭', octave: 4, ledgerLines: 0, accidental: 'flat', baseNote: 'B4' },
  { id: 'B4', name: 'B', octave: 4, ledgerLines: 0, accidental: null },
  { id: 'C5', name: 'C', octave: 5, ledgerLines: 0, accidental: null },
  { id: 'C#5', name: 'C♯', octave: 5, ledgerLines: 0, accidental: 'sharp', baseNote: 'C5' },
  { id: 'D5', name: 'D', octave: 5, ledgerLines: 0, accidental: null },
  { id: 'Eb5', name: 'E♭', octave: 5, ledgerLines: 0, accidental: 'flat', baseNote: 'E5' },
  { id: 'E5', name: 'E', octave: 5, ledgerLines: 0, accidental: null },
  { id: 'F5', name: 'F', octave: 5, ledgerLines: 0, accidental: null },
  { id: 'F#5', name: 'F♯', octave: 5, ledgerLines: 0, accidental: 'sharp', baseNote: 'F5' },
  { id: 'G5', name: 'G', octave: 5, ledgerLines: 0, accidental: null },
  { id: 'A5', name: 'A', octave: 5, ledgerLines: 1, accidental: null },
];

export const BASS_NOTES = [
  { id: 'E2', name: 'E', octave: 2, ledgerLines: 1, accidental: null },
  { id: 'F2', name: 'F', octave: 2, ledgerLines: 0, accidental: null },
  { id: 'F#2', name: 'F♯', octave: 2, ledgerLines: 0, accidental: 'sharp', baseNote: 'F2' },
  { id: 'G2', name: 'G', octave: 2, ledgerLines: 0, accidental: null },
  { id: 'Ab2', name: 'A♭', octave: 2, ledgerLines: 0, accidental: 'flat', baseNote: 'A2' },
  { id: 'A2', name: 'A', octave: 2, ledgerLines: 0, accidental: null },
  { id: 'Bb2', name: 'B♭', octave: 2, ledgerLines: 0, accidental: 'flat', baseNote: 'B2' },
  { id: 'B2', name: 'B', octave: 2, ledgerLines: 0, accidental: null },
  { id: 'C3', name: 'C', octave: 3, ledgerLines: 0, accidental: null },
  { id: 'C#3', name: 'C♯', octave: 3, ledgerLines: 0, accidental: 'sharp', baseNote: 'C3' },
  { id: 'D3', name: 'D', octave: 3, ledgerLines: 0, accidental: null },
  { id: 'Eb3', name: 'E♭', octave: 3, ledgerLines: 0, accidental: 'flat', baseNote: 'E3' },
  { id: 'E3', name: 'E', octave: 3, ledgerLines: 0, accidental: null },
  { id: 'F3', name: 'F', octave: 3, ledgerLines: 0, accidental: null },
  { id: 'F#3', name: 'F♯', octave: 3, ledgerLines: 0, accidental: 'sharp', baseNote: 'F3' },
  { id: 'G3', name: 'G', octave: 3, ledgerLines: 0, accidental: null },
  { id: 'Ab3', name: 'A♭', octave: 3, ledgerLines: 0, accidental: 'flat', baseNote: 'A3' },
  { id: 'A3', name: 'A', octave: 3, ledgerLines: 0, accidental: null },
  { id: 'Bb3', name: 'B♭', octave: 3, ledgerLines: 0, accidental: 'flat', baseNote: 'B3' },
  { id: 'B3', name: 'B', octave: 3, ledgerLines: 0, accidental: null },
  { id: 'C4', name: 'C', octave: 4, ledgerLines: 1, accidental: null },
];

export const ALL_NOTE_NAMES = [
  'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'
];

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
