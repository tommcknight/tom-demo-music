import { useState, useRef } from 'react';

export default function SheetUploadScreen({ onTranscribed, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setLoading(true);

    try {
      let images = [];

      if (file.type === 'application/pdf') {
        images = await pdfToImages(file);
      } else if (file.type.startsWith('image/')) {
        const dataUrl = await fileToDataUrl(file);
        images = [dataUrl];
      } else {
        throw new Error('Please upload a PDF or image file');
      }

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(text || `Server error (${res.status})`); }
      if (!res.ok) throw new Error(data.error || 'Transcription failed');
      if (!data.notes?.length) throw new Error('No notes found in the sheet music');

      onTranscribed(data.notes);
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
      <p className="subtitle">Upload sheet music and hear it played note by note!</p>

      <div className="settings-card">
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px' }}>
          Upload a PDF or image of sheet music. AI will read the notes and play them back for you.
          Works best with simple, single-melody pieces.
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
          accept=".pdf,image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />

        {fileName && !loading && !error && (
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#888' }}>{fileName}</p>
        )}

        {loading && (
          <div className="sp-loading">
            <div className="spinner" />
            <p>AI is reading the sheet music... this may take a moment.</p>
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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function pdfToImages(file) {
  const pdfjsLib = await import('pdfjs-dist');
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images = [];

  // Render up to 4 pages
  const pageCount = Math.min(pdf.numPages, 4);
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL('image/jpeg', 0.8));
  }

  return images;
}
