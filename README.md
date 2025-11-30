# BillScan

Use a MultiModal AI workflow to scan a receipt or bill, extract structured data, and persist it.

## Overview

BillScan consists of two parts:

1. **Frontend** (`frontend/`) - Vite + React + TypeScript for uploading images, viewing extracted bill data, and interacting with AI services.
2. **Backend** (`backend/`) - Express + SQLite providing REST endpoints to store and retrieve bills.

## Project Structure

```
BillScan/
├── frontend/           # React frontend application
│   ├── components/     # Reusable UI components
│   ├── services/       # AI and storage service integrations
│   ├── views/          # Page components
│   ├── Dockerfile      # Frontend Docker build
│   └── ...
├── backend/            # Express backend API
│   ├── index.js        # Server entry point
│   ├── db.js           # SQLite database setup
│   ├── Dockerfile      # Backend Docker build
│   └── ...
├── docker-compose.yml  # Docker orchestration
├── LICENSE
└── README.md
```

## Prerequisites

- Node.js (v18+ recommended) - for local development
- Docker and Docker Compose - for containerized deployment
- API key for at least one AI service (see AI Service Configuration below)

## AI Service Configuration

BillScan supports multiple AI services for bill/receipt extraction. Configure which service to use by setting the `AI_SERVICE` environment variable in your `backend/.env` file.

### Supported Services

1. **Gemini** (default) - Google's Gemini AI
   ```env
   AI_SERVICE=gemini
   GEMINI_API_KEY=your_gemini_key_here
   ```

2. **OpenAI** - GPT-4 Vision or GPT-4o
   ```env
   AI_SERVICE=openai
   OPENAI_API_KEY=your_openai_key_here
   ```

3. **Claude** - Anthropic's Claude with vision
   ```env
   AI_SERVICE=claude
   ANTHROPIC_API_KEY=your_anthropic_key_here
   ```

4. **Ollama** - Local AI models
   ```env
   AI_SERVICE=ollama
   OLLAMA_HOST=http://localhost:11434  # Optional, defaults to localhost:11434
   ```

If `AI_SERVICE` is not set, the application defaults to `gemini`

## Quick Start with Docker

The easiest way to run BillScan is with Docker Compose:

1. Create a `.env` file in the project root with your API keys:
   ```bash
   # .env file
   GEMINI_API_KEY=your_key_here
   AI_SERVICE=gemini
   # Add other keys as needed (see AI Service Configuration above)
   ```

2. Build and start the containers:
   ```bash
   docker compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8080/api (proxied through frontend)

4. To stop the containers:
   ```bash
   docker compose down
   ```

## Setup & Run (Frontend)

From the `frontend/` directory:

1. Install dependencies:
   ```cmd
   cd frontend
   npm install
   ```
2. Configure your AI service in `.env` (create the file if missing):
   ```env
   # Choose your AI service
   AI_SERVICE=gemini  # or openai, claude, ollama
   
   # For Gemini (default):
   GEMINI_API_KEY=your_key_here
   
   # For OpenAI:
   # OPENAI_API_KEY=your_key_here
   
   # For Claude:
   # ANTHROPIC_API_KEY=your_key_here
   
   # For Ollama (local):
   # OLLAMA_HOST=http://localhost:11434
   # OLLAMA_MODEL=gemma3
   ```
3. Start the dev server:
   ```cmd
   npm run dev
   ```
4. Open the printed local URL (typically `http://localhost:3001`).

## Setup & Run (Backend)

The backend lives in `backend/` and uses an on-disk SQLite database `bills.db` created automatically.

1. Install backend dependencies:
   ```cmd
   cd backend
   npm install
   ```
2. Start the server (port 3000 by default):
   ```cmd
   node index.js
   ```
   You should see: `Server running on http://localhost:3000`.

If you prefer, add a script to `backend/package.json`:
```json
"scripts": { "start": "node index.js" }
```
Then run:
```cmd
npm start
```


### Docker Troubleshooting

- If Docker build fails, ensure you have Docker and Docker Compose installed.
- To reset Docker data: `docker compose down -v` (removes volumes and data).
- View container logs: `docker compose logs -f`
- Rebuild containers after code changes: `docker compose up --build`
