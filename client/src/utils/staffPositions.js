// Maps note IDs to Y positions on a staff SVG
// Staff lines are at y = 40, 50, 60, 70, 80 (top to bottom, 10px apart)
// Each half-step on the staff = 5px

// Treble clef: lines from top = F5, D5, B4, G4, E4
// Spaces from top = E5, C5, A4, F4
// Below staff: D4 (just below), C4 (ledger line)

const TREBLE_POSITIONS = {
  'A5': 25,  // above staff, 1 ledger line
  'G5': 30,
  'F5': 35,  // top line
  'E5': 40,
  'D5': 45,  // 2nd line
  'C5': 50,
  'B4': 55,  // 3rd line (middle)
  'A4': 60,
  'G4': 65,  // 4th line
  'F4': 70,
  'E4': 75,  // bottom line
  'D4': 80,
  'C4': 85,  // below staff, 1 ledger line (middle C)
};

// Bass clef: lines from top = A3, F3, D3, B2, G2
// Spaces from top = G3, E3, C3, A2
// Below staff: F2 (just below), E2 (ledger line)

const BASS_POSITIONS = {
  'C4': 25,  // above staff, 1 ledger line (middle C)
  'B3': 30,
  'A3': 35,  // top line
  'G3': 40,
  'F3': 45,  // 2nd line
  'E3': 50,
  'D3': 55,  // 3rd line (middle)
  'C3': 60,
  'B2': 65,  // 4th line
  'A2': 70,
  'G2': 75,  // bottom line
  'F2': 80,
  'E2': 85,  // below staff, 1 ledger line
};

export function getStaffPosition(noteId, clef) {
  const positions = clef === 'treble' ? TREBLE_POSITIONS : BASS_POSITIONS;
  // Sharps/flats use the position of their base natural note
  if (positions[noteId] != null) return positions[noteId];
  // Strip accidental: 'C#4' -> 'C4', 'Eb4' -> 'E4', 'Ab4' -> 'A4', 'Bb4' -> 'B4'
  const base = noteId.replace(/[#b]/, '');
  return positions[base] ?? 55;
}

// Whether the note needs a ledger line
export function needsLedgerLine(noteId, clef) {
  const base = noteId.replace(/[#b]/, '');
  if (clef === 'treble') {
    return base === 'C4' || base === 'A5';
  }
  return base === 'E2' || base === 'C4';
}

// Y position of the ledger line
export function getLedgerLineY(noteId, clef) {
  const pos = getStaffPosition(noteId, clef);
  return pos; // ledger line goes through the note center
}
