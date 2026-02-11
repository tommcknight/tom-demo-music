import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'notequest.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    avg_response_time_ms REAL,
    streak_max INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES sessions(id),
    question_number INTEGER NOT NULL,
    clef TEXT NOT NULL,
    note TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    response_time_ms INTEGER,
    created_at TEXT NOT NULL
  );
`);

// Prepared statements
const insertSession = db.prepare(`
  INSERT INTO sessions (started_at, ended_at, total_questions, correct_answers, accuracy, avg_response_time_ms, streak_max)
  VALUES (@started_at, @ended_at, @total_questions, @correct_answers, @accuracy, @avg_response_time_ms, @streak_max)
`);

const insertAnswer = db.prepare(`
  INSERT INTO answers (session_id, question_number, clef, note, correct_answer, user_answer, is_correct, response_time_ms, created_at)
  VALUES (@session_id, @question_number, @clef, @note, @correct_answer, @user_answer, @is_correct, @response_time_ms, @created_at)
`);

export function saveSession(sessionData) {
  const result = insertSession.run({
    started_at: sessionData.startedAt,
    ended_at: sessionData.endedAt,
    total_questions: sessionData.totalQuestions,
    correct_answers: sessionData.correctAnswers,
    accuracy: sessionData.accuracy,
    avg_response_time_ms: sessionData.avgResponseTimeMs,
    streak_max: sessionData.streakMax,
  });

  const sessionId = result.lastInsertRowid;

  const insertMany = db.transaction((answers) => {
    for (const a of answers) {
      insertAnswer.run({
        session_id: sessionId,
        question_number: a.questionNumber,
        clef: a.clef,
        note: a.note,
        correct_answer: a.correctAnswer,
        user_answer: a.userAnswer,
        is_correct: a.isCorrect ? 1 : 0,
        response_time_ms: a.responseTimeMs,
        created_at: a.createdAt,
      });
    }
  });

  insertMany(sessionData.answers);
  return sessionId;
}

export function getSessions() {
  return db.prepare('SELECT * FROM sessions ORDER BY started_at DESC').all();
}

export function getSession(id) {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!session) return null;
  const answers = db.prepare('SELECT * FROM answers WHERE session_id = ? ORDER BY question_number').all(id);
  return { ...session, answers };
}

export default db;
