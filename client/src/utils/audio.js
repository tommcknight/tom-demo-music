// Web Audio API piano note synthesizer
// Maps note IDs to frequencies in Hz

const NOTE_FREQUENCIES = {
  'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
  'Ab2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'Eb3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
  'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'Eb4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'Eb5': 622.25,
  'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
  'A5': 880.00,
};

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playNote(noteId, duration = 1.2) {
  const freq = NOTE_FREQUENCIES[noteId];
  if (!freq) return;

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Oscillator for fundamental tone
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  // Second oscillator for richness (slightly detuned)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq, now);
  osc2.detune.setValueAtTime(3, now);

  // Gentle harmonics
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(freq * 2, now);

  // Envelope for piano-like attack and decay
  const gainMain = ctx.createGain();
  gainMain.gain.setValueAtTime(0, now);
  gainMain.gain.linearRampToValueAtTime(0.35, now + 0.01);
  gainMain.gain.exponentialRampToValueAtTime(0.15, now + 0.3);
  gainMain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const gainHarmonic = ctx.createGain();
  gainHarmonic.gain.setValueAtTime(0, now);
  gainHarmonic.gain.linearRampToValueAtTime(0.08, now + 0.01);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);

  osc.connect(gainMain);
  osc2.connect(gainMain);
  osc3.connect(gainHarmonic);
  gainMain.connect(ctx.destination);
  gainHarmonic.connect(ctx.destination);

  osc.start(now);
  osc2.start(now);
  osc3.start(now);
  osc.stop(now + duration);
  osc2.stop(now + duration);
  osc3.stop(now + duration);
}
