import { getStaffPosition, needsLedgerLine } from '../utils/staffPositions.js';

// SVG paths for clef symbols (simplified)
const TREBLE_CLEF = (
  <text x="12" y="72" fontSize="62" fontFamily="serif" fill="#1e1b4b">𝄞</text>
);

const BASS_CLEF = (
  <text x="12" y="62" fontSize="50" fontFamily="serif" fill="#1e1b4b">𝄢</text>
);

export default function Flashcard({ note, clef, revealed, userAnswer }) {
  const staffTop = 35;
  const lineSpacing = 10;
  const staffLines = [0, 1, 2, 3, 4].map(i => staffTop + i * lineSpacing);
  const noteY = getStaffPosition(note.id, clef);
  const showLedger = needsLedgerLine(note.id, clef);

  const noteColor = revealed
    ? userAnswer === note.name ? 'var(--color-success)' : 'var(--color-error)'
    : 'var(--color-primary)';

  const accidentalSymbol = note.accidental === 'sharp' ? '♯' : note.accidental === 'flat' ? '♭' : null;

  return (
    <div className="flashcard">
      <svg viewBox="0 0 160 110" width="320" height="220" aria-label={`Music note on ${clef} clef staff`}>
        {/* Staff lines */}
        {staffLines.map((y, i) => (
          <line key={i} x1="10" y1={y} x2="150" y2={y} stroke="#cbd5e1" strokeWidth="1.5" />
        ))}

        {/* Clef symbol */}
        {clef === 'treble' ? TREBLE_CLEF : BASS_CLEF}

        {/* Ledger lines */}
        {showLedger && (
          <line
            x1="85" y1={noteY} x2="115" y2={noteY}
            stroke="#cbd5e1" strokeWidth="1.5"
          />
        )}

        {/* Accidental symbol */}
        {accidentalSymbol && (
          <text
            x="80" y={noteY + 5}
            fontSize="16" fontFamily="serif" fontWeight="bold"
            fill={noteColor} textAnchor="middle"
          >
            {accidentalSymbol}
          </text>
        )}

        {/* Note head (filled oval) */}
        <ellipse
          cx="100" cy={noteY}
          rx="7" ry="5"
          fill={noteColor}
          transform={`rotate(-15, 100, ${noteY})`}
        />

        {/* Stem */}
        {noteY >= 55 ? (
          <line x1="107" y1={noteY} x2="107" y2={noteY - 30} stroke={noteColor} strokeWidth="1.5" />
        ) : (
          <line x1="93" y1={noteY} x2="93" y2={noteY + 30} stroke={noteColor} strokeWidth="1.5" />
        )}
      </svg>
    </div>
  );
}
