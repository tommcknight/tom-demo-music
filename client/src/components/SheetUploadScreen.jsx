import { useState, useRef, useEffect } from 'react';

export default function SheetUploadScreen({ onTranscribed, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [logs, setLogs] = useState([]);
  const fileRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();

    // If it's already a MusicXML file, pass it directly
    if (ext === '.xml' || ext === '.musicxml' || ext === '.mxl') {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      onTranscribed({ mxl: base64, filename: file.name });
      return;
    }

    const validExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
    if (!validExts.includes(ext)) {
      setError('Please upload a PDF, image, or MusicXML file');
      return;
    }

    setFileName(file.name);
    setError(null);
    setLogs([]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === 'log') {
            setLogs(prev => [...prev, data.message]);
          } else if (data.type === 'done') {
            onTranscribed(data);
            return;
          } else if (data.type === 'error') {
            throw new Error(data.message);
          }
        }
      }

      throw new Error('Connection ended without result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="start-screen">
      <div className="logo">🎼</div>
      <h1>Sheet Music Player</h1>
      <p className="subtitle">Upload sheet music and hear it played with piano sound!</p>

      <div className="settings-card">
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px' }}>
          Upload a PDF or image of sheet music. Audiveris OMR reads the notes
          and OSMD plays them back with realistic piano sound.
        </p>

        <button
          className="btn-primary"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? '🔍 Reading music...' : '📄 Choose File'}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.xml,.musicxml,.mxl"
          onChange={handleFile}
          style={{ display: 'none' }}
        />

        {fileName && !loading && !error && (
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#888' }}>{fileName}</p>
        )}

        {loading && (
          <div className="sp-loading">
            <div className="spinner" />
            <div className="sp-log" ref={logRef}>
              {logs.map((msg, i) => (
                <div key={i} className="sp-log-line">{msg}</div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="sp-error">
            <p>❌ {error}</p>
            <button className="btn-secondary" onClick={() => { setError(null); setFileName(''); }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <button className="btn-secondary" onClick={onBack}>
        ← Back to Home
      </button>
    </div>
  );
}
