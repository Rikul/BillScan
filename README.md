# BillScan

Use a MultiModal AI workflow to scan a receipt or bill, extract structured data, and persist it.

## Overview

BillScan consists of two parts:

1. Frontend (Vite + TypeScript) for uploading images, viewing extracted bill data, and interacting with AI services.
2. Express + SQLite backend (`server/`) providing REST endpoints to store and retrieve bills.

## Prerequisites

- Node.js (v18+ recommended)
- (Optional) Gemini API key for AI extraction: set `GEMINI_API_KEY` in `.env.local`

## Setup & Run (Frontend)

From the project root:

1. Install dependencies:
   ```cmd
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` (create the file if missing):
   ```env
   GEMINI_API_KEY=your_key_here
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
4. AI services invoked via configured API key (`GEMINI_API_KEY`).

## Troubleshooting

- If the server fails to start, ensure port 3000 is free.
- Delete `server/bills.db` to reset stored data (schema recreated automatically).
- Large image uploads: body size limit set to `50mb`; adjust in `server/index.js` if needed.
