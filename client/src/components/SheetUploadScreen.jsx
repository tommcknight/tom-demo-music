import { useState, useRef } from 'react';

export default function SheetUploadScreen({ onTranscribed, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
      'application/vnd.recordare.musicxml+xml', 'application/xml', 'text/xml'];
    const validExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.xml', '.musicxml', '.mxl'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    // If it's already a MusicXML file, pass it directly
    if (ext === '.xml' || ext === '.musicxml' || ext === '.mxl') {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      onTranscribed({ mxl: base64, filename: file.name });
      return;
    }

    if (!validExts.includes(ext)) {
      setError('Please upload a PDF, image, or MusicXML file');
      return;
    }

    setFileName(file.name);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(text || `Server error (${res.status})`); }
      if (!res.ok) throw new Error(data.error || 'Transcription failed');
      if (!data.mxl) throw new Error('No music data returned');

      onTranscribed(data);
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
            <p>Reading sheet music with Audiveris... this may take a moment.</p>
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
