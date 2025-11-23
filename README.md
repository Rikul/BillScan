# BillScan

Use a MultiModal to scan a receipt or bill and store it.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure the AI service (choose one):
   
   ### Using Gemini (Default)
   - Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   
   ### Using Ollama
   - Set `AI_SERVICE=ollama` in [.env.local](.env.local)
   - Set `OLLAMA_HOST` (default: `http://localhost:11434`)
   - Set `OLLAMA_MODEL` (default: `gemma3`)
   - Note: Ollama receives the original uploaded image without any modifications

3. Run the app:
   `npm run dev`
