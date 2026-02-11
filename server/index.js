import express from 'express';
import cors from 'cors';
import { saveSession, getSessions, getSession } from './db.js';
import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`🎵 Note Quest API running on http://localhost:${PORT}`);
});
