import { useState, useEffect, useRef, useCallback } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import Soundfont from 'soundfont-player';

export default function SheetPlayer({ sheetData, onBack }) {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const pianoRef = useRef(null);
  const cursorTimerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState(120); // BPM
  const [error, setError] = useState(null);

  // Initialize OSMD and load the MusicXML
  useEffect(() => {
    if (!containerRef.current || !sheetData?.mxl) return;

    const initOSMD = async () => {
      try {
        const osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          drawTitle: true,
          drawComposer: true,
          followCursor: true,
        });
        osmdRef.current = osmd;

        // Load the MusicXML string
        if (sheetData.xml) {
          await osmd.load(sheetData.xml);
        } else if (sheetData.mxl) {
          // Fallback for direct .mxl upload — decode base64 to string
          const binaryStr = atob(sheetData.mxl);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const text = new TextDecoder().decode(bytes);
          await osmd.load(text);
        }

        osmd.render();
        osmd.cursor.show();
        osmd.cursor.reset();
        setReady(true);

        // Load piano SoundFont
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const piano = await Soundfont.instrument(ac, 'acoustic_grand_piano');
        pianoRef.current = { ac, piano };
      } catch (err) {
        console.error('OSMD init error:', err);
        setError('Failed to display sheet music: ' + err.message);
      }
    };

    initOSMD();

    return () => {
      if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
    };
  }, [sheetData]);

  const stopPlayback = useCallback(() => {
    setPlaying(false);
    if (cursorTimerRef.current) {
      clearTimeout(cursorTimerRef.current);
      cursorTimerRef.current = null;
    }
  }, []);

  const playStep = useCallback(() => {
    const osmd = osmdRef.current;
    const inst = pianoRef.current;
    if (!osmd || !inst || !osmd.cursor.iterator.currentMeasure) {
      stopPlayback();
      return;
    }

    if (osmd.cursor.iterator.endReached) {
      stopPlayback();
      return;
    }

    // Get notes under the cursor
    const voices = osmd.cursor.VoicesUnderCursor();
    for (const entry of voices) {
      for (const note of entry.Notes) {
        if (note.isRest()) continue;
        const midiNote = note.halfTone + 12; // OSMD uses halfTone from C-1
        const duration = (note.Length.RealValue * 4 * 60) / tempo;
        inst.piano.play(midiNote, inst.ac.currentTime, { duration: Math.max(0.1, duration) });
      }
    }

    // Calculate duration of current beat
    const beatDuration = (60 / tempo) * 1000; // ms per quarter note

    osmd.cursor.next();

    cursorTimerRef.current = setTimeout(playStep, beatDuration);
  }, [tempo, stopPlayback]);

  const startPlayback = useCallback(() => {
    const osmd = osmdRef.current;
    if (!osmd) return;
    osmd.cursor.reset();
    osmd.cursor.show();
    setPlaying(true);
    playStep();
  }, [playStep]);

  const resumePlayback = useCallback(() => {
    setPlaying(true);
    playStep();
  }, [playStep]);

  const restart = useCallback(() => {
    stopPlayback();
    const osmd = osmdRef.current;
    if (osmd) {
      osmd.cursor.reset();
      osmd.cursor.show();
    }
  }, [stopPlayback]);

  return (
    <div className="sheet-player">
      <div className="session-top-bar">
        <button className="btn-home" onClick={() => { stopPlayback(); onBack(); }} title="Back to Home">
          🏠
        </button>
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: '18px' }}>🎶 Sheet Music Player</h2>
      </div>

      {error && (
        <div className="sp-error">
          <p>❌ {error}</p>
        </div>
      )}

      <div ref={containerRef} className="sp-osmd-container" />

      {ready && (
        <>
          <div className="sp-controls">
            {!playing ? (
              <button className="btn-primary" onClick={startPlayback}>
                ▶ Play
              </button>
            ) : (
              <button className="btn-secondary" onClick={stopPlayback}>
                ⏸ Pause
              </button>
            )}
            <button className="btn-secondary" onClick={restart}>
              ⏮ Restart
            </button>
          </div>

          <div className="sp-tempo">
            <label>Tempo: {tempo} BPM</label>
            <input
              type="range"
              min="40"
              max="240"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
            />
          </div>
        </>
      )}

      {!ready && !error && (
        <div className="sp-loading">
          <div className="spinner" />
          <p>Loading sheet music and piano sounds...</p>
        </div>
      )}
    </div>
  );
}
