import { useState } from 'react';

export default function NamePrompt({ onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="name-prompt">
      <div className="logo">🎵</div>
      <h1>Note Quest</h1>
      <p className="subtitle">Welcome! What's your name?</p>

      <form onSubmit={handleSubmit} className="name-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="name-input"
          autoFocus
          maxLength={30}
        />
        <button type="submit" className="btn-primary" disabled={!name.trim()}>
          Let's Go! 🚀
        </button>
      </form>
    </div>
  );
}
