# BillScan

Use a MultiModal AI workflow to scan a receipt or bill, extract structured data, and persist it.

## Overview

BillScan consists of two parts:

1. Frontend (Vite + TypeScript) for uploading images, viewing extracted bill data, and interacting with AI services.
2. Express + SQLite backend (`server/`) providing REST endpoints to store and retrieve bills.

## Prerequisites

- Node.js (v18+ recommended)
- API key for at least one AI service (see AI Service Configuration below)

## AI Service Configuration

BillScan supports multiple AI services for bill/receipt extraction. Configure which service to use by setting the `AI_SERVICE` environment variable in your `.env.local` file.

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
   OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4o-mini
   ```

3. **Claude** - Anthropic's Claude with vision
   ```env
   AI_SERVICE=claude
   ANTHROPIC_API_KEY=your_anthropic_key_here
   ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # Optional
   ```

4. **Ollama** - Local AI models
   ```env
   AI_SERVICE=ollama
   OLLAMA_HOST=http://localhost:11434  # Optional, defaults to localhost:11434
   OLLAMA_MODEL=gemma3  # Optional, defaults to gemma3
   ```

If `AI_SERVICE` is not set, the application defaults to `gemini` for backward compatibility.

## Setup & Run (Frontend)

From the project root:

1. Install dependencies:
   ```cmd
   npm install
   ```
2. Configure your AI service in `.env.local` (create the file if missing):
   ```env
   # Choose your AI service
   AI_SERVICE=gemini  # or openai, claude, ollama
   
   # For Gemini (default):
   GEMINI_API_KEY=your_key_here
   
   # For OpenAI:
   # OPENAI_API_KEY=your_key_here
   # OPENAI_MODEL=gpt-4o-mini
   
   # For Claude:
   # ANTHROPIC_API_KEY=your_key_here
   # ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
   
   # For Ollama (local):
   # OLLAMA_HOST=http://localhost:11434
   # OLLAMA_MODEL=gemma3
   ```
3. Start the dev server:
   ```cmd
   npm run dev
   ```
4. Open the printed local URL (typically `http://localhost:5173`).

## Setup & Run (Express Server)

The backend lives in `server/` and uses an on-disk SQLite database `bills.db` created automatically.

1. Install server dependencies:
   ```cmd
   cd server
   npm install
   ```
2. Start the server (port 3000 by default):
   ```cmd
   node index.js
   ```
   You should see: `Server running on http://localhost:3000`.

If you prefer, add a script to `server/package.json`:
```json
"scripts": { "start": "node index.js" }
```
Then run:
```cmd
npm start
```

## REST API Endpoints

Base URL: `http://localhost:3000`

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/bills` | List all bills (ordered by date desc). |
| GET | `/api/bills/:id` | Fetch a single bill by ID. |
| POST | `/api/bills` | Create or update a bill (upsert). Requires `id`, `storeName`, `date`, `subtotal`, `tax`, `total`, `currency`. Optional: `imageData`, `createdAt`, `lineItems` (array). |
| DELETE | `/api/bills/:id` | Delete a bill by ID. |


## Development Workflow

1. Run backend (`server/`) on port 3000.
2. Run frontend dev server.
3. Frontend calls REST API under `/api/bills` for persistence.
4. AI service is selected based on the `AI_SERVICE` environment variable and invoked with the configured API key.

## Architecture

### AI Service Abstraction

The application uses a pluggable AI service architecture:

- **Interface**: `IAIService` defines the contract for all AI services
- **Implementations**: 
  - `geminiService.ts` - Google Gemini
  - `openaiService.ts` - OpenAI GPT-4o
  - `claudeService.ts` - Anthropic Claude
  - `ollamaService.ts` - Local Ollama models
- **Factory**: `aiService.ts` - Dynamically loads the configured service
- **Benefits**: Easy to add new AI providers, switch between services, and test different models

## Troubleshooting

- If the server fails to start, ensure port 3000 is free.
- Delete `server/bills.db` to reset stored data (schema recreated automatically).
- Large image uploads: body size limit set to `50mb`; adjust in `server/index.js` if needed.
