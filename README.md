# 🎵 Note Quest

A Duolingo-inspired web app for learning to read music notes on the treble and bass clef staff.

## Features

- 🎼 Visual flashcards with notes rendered on treble & bass clef staffs
- ⏱️ Timed 10-note practice sessions
- 📊 Session statistics (accuracy, average response time, best streak)
- 📈 Session history tracking via local SQLite database
- ✨ AI-powered encouragement messages via GitHub Models
- 🎉 Fun animations, streaks, and confetti for perfect scores

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [GitHub personal access token](https://github.com/settings/tokens) (optional, for AI encouragement)

## Setup

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Optional: set GitHub token for AI encouragement
export GITHUB_TOKEN=your_github_token_here

# Start both client and server
npm run dev
```

The app will be available at **http://localhost:5173**.

## Architecture

| Component | Tech |
|-----------|------|
| Frontend | React + Vite |
| Backend | Express.js |
| Database | SQLite (better-sqlite3) |
| AI | GitHub Models (GPT-4o-mini) |

## How It Works

1. Click **Start Practice** to begin a 10-note session
2. A note appears on a treble or bass clef staff
3. Click the correct note name (A–G) as fast as you can
4. Get instant feedback with encouragement and streak tracking
5. See your results and AI-generated encouragement at the end
6. Track your progress over time in the History screen
