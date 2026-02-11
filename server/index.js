import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { saveSession, getSessions, getSession } from './db.js';
import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const app = express();
const PORT = 3002;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Save a completed session
app.post('/api/sessions', (req, res) => {
  try {
    const id = saveSession(req.body);
    res.json({ id });
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// Get all sessions
app.get('/api/sessions', (_req, res) => {
  try {
    const sessions = getSessions();
    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get a single session with answers
app.get('/api/sessions/:id', (req, res) => {
  try {
    const session = getSession(Number(req.params.id));
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// AI encouragement via GitHub Models
app.post('/api/encouragement', async (req, res) => {
  const { accuracy, correctAnswers, totalQuestions, avgResponseTimeMs, streakMax, playerName } = req.body;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.json({ message: getStaticEncouragement(accuracy) });
  }

  try {
    const client = ModelClient(
      'https://models.inference.ai.azure.com',
      new AzureKeyCredential(token)
    );

    const response = await client.path('/chat/completions').post({
      body: {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a fun, encouraging music teacher for a child learning to read music notes. Keep responses to 2-3 short sentences. Use emojis. Be warm and motivating.'
          },
          {
            role: 'user',
            content: `A student named ${playerName || 'a young musician'} just finished a music note reading practice session. They got ${correctAnswers} out of ${totalQuestions} correct (${accuracy}% accuracy). Their average response time was ${(avgResponseTimeMs / 1000).toFixed(1)} seconds. Their best streak was ${streakMax} in a row. Give them a short, personalized encouragement message using their name.`
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }
    });

    const message = response.body.choices?.[0]?.message?.content;
    res.json({ message: message || getStaticEncouragement(accuracy) });
  } catch (err) {
    console.error('AI encouragement error:', err.message);
    res.json({ message: getStaticEncouragement(accuracy) });
  }
});

function getStaticEncouragement(accuracy) {
  if (accuracy === 100) return "🏆 Perfect score! You're a music reading superstar! Keep up the amazing work!";
  if (accuracy >= 80) return "🌟 Great job! You really know your notes! A little more practice and you'll be perfect!";
  if (accuracy >= 60) return "👍 Good effort! You're getting better every time. Keep practicing and you'll be a pro!";
  return "💪 Every practice session makes you stronger! Keep at it and you'll be reading notes like a pro in no time!";
}

// Transcribe sheet music images via GPT-4o vision
app.post('/api/transcribe', async (req, res) => {
  const { images } = req.body; // array of base64 data URLs
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(400).json({ error: 'GitHub token not available for AI transcription' });
  }

  if (!images || !images.length) {
    return res.status(400).json({ error: 'No images provided' });
  }

  try {
    const client = ModelClient(
      'https://models.inference.ai.azure.com',
      new AzureKeyCredential(token)
    );

    const imageMessages = images.map(img => ({
      type: 'image_url',
      image_url: { url: img, detail: 'high' }
    }));

    const response = await client.path('/chat/completions').post({
      body: {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert music transcription assistant. Analyze sheet music images and extract every note in order from left to right, top staff to bottom staff.

Return ONLY a valid JSON array of note objects. Each note object must have:
- "note": the note name with octave (e.g. "C4", "F#3", "Eb5")
- "duration": duration type ("whole", "half", "quarter", "eighth", "sixteenth")
- "clef": "treble" or "bass"
- "isRest": true if it's a rest (omit "note" for rests)

Use standard scientific pitch notation (C4 = middle C).
For sharps use # (e.g. "F#4"), for flats use b (e.g. "Eb4").
If there are two staves (grand staff), list treble clef notes first for each beat, then bass.
For simplicity, focus on the melody (top voice) if there are chords.

Example output:
[{"note":"C4","duration":"quarter","clef":"treble"},{"note":"D4","duration":"quarter","clef":"treble"},{"note":"E4","duration":"half","clef":"treble"}]`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please transcribe all notes from this sheet music in order:' },
              ...imageMessages
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }
    });

    console.log('AI response status:', response.status);
    if (String(response.status) !== '200') {
      const errBody = response.body;
      console.error('AI API error:', JSON.stringify(errBody));
      return res.status(502).json({ error: `AI API returned ${response.status}: ${errBody?.error?.message || JSON.stringify(errBody)}` });
    }

    const content = response.body.choices?.[0]?.message?.content || '';
    // Extract JSON from the response (might be wrapped in markdown code block)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(422).json({ error: 'Could not parse notes from AI response', raw: content });
    }

    const notes = JSON.parse(jsonMatch[0]);
    res.json({ notes });
  } catch (err) {
    console.error('Transcription error:', err.message);
    res.status(500).json({ error: 'Transcription failed: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Note Quest API running on http://localhost:${PORT}`);
});
