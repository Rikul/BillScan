import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OLLAMA_HOST': JSON.stringify(env.OLLAMA_HOST),
        'process.env.OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.OPENAI_MODEL': JSON.stringify(env.OPENAI_MODEL),
        'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY),
        'process.env.ANTHROPIC_MODEL': JSON.stringify(env.ANTHROPIC_MODEL),
        'process.env.AI_SERVICE': JSON.stringify(env.AI_SERVICE),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'ollama': path.resolve(__dirname, 'node_modules/ollama/dist/browser.mjs'),
        }
      }
    };
});
