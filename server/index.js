import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { execFile } from 'child_process';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { saveSession, getSessions, getSession } from './db.js';
import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// Transcribe sheet music via Audiveris OMR (PDF/image → MusicXML)
// Uses SSE to stream progress to the client
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  const tmpDir = await mkdtemp(join(tmpdir(), 'nq-'));
  const ext = req.file.originalname.endsWith('.pdf') ? '.pdf' : '.png';
  const inputPath = join(tmpDir, `input${ext}`);
  const outputDir = join(tmpDir, 'out');

  try {
    await writeFile(inputPath, req.file.buffer);
    const { mkdirSync } = await import('fs');
    mkdirSync(outputDir, { recursive: true });

    send('log', { message: '📄 File received, starting Audiveris OMR...' });

    const audiverisPath = '/Applications/Audiveris.app/Contents/MacOS/Audiveris';
    const { spawn } = await import('child_process');

    const proc = spawn(audiverisPath, ['-batch', '-export', '-output', outputDir, inputPath], {
      timeout: 120000,
    });

    // Stream all output to client
    const streamLines = (chunk) => {
      const lines = chunk.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        let msg = line.trim();
        // Extract the useful part after the pipe separator if present
        const pipeIdx = msg.lastIndexOf('|');
        const content = pipeIdx >= 0 ? msg.substring(pipeIdx + 1).trim() : msg;
        if (!content) continue;
        send('log', { message: content });
      }
    };

    proc.stdout.on('data', streamLines);
    proc.stderr.on('data', streamLines);

    const exitCode = await new Promise((resolve, reject) => {
      proc.on('close', resolve);
      proc.on('error', reject);
    });

    if (exitCode !== 0) {
      send('error', { message: 'Audiveris failed to process the file.' });
      res.end();
      return;
    }

    // Find the .mxl output file
    const { readdirSync, readFileSync } = await import('fs');
    const files = readdirSync(outputDir);
    const mxlFile = files.find(f => f.endsWith('.mxl'));

    if (!mxlFile) {
      send('error', { message: 'Could not read the sheet music. Try a clearer image.' });
      res.end();
      return;
    }

    send('log', { message: '🎹 Loading into player...' });

    const mxlData = readFileSync(join(outputDir, mxlFile));
    send('done', { mxl: mxlData.toString('base64'), filename: mxlFile });
    res.end();
  } catch (err) {
    console.error('Transcription error:', err.message);
    send('error', { message: 'Transcription failed: ' + err.message });
    res.end();
  } finally {
    const { rmSync } = await import('fs');
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Note Quest API running on http://localhost:${PORT}`);
});
