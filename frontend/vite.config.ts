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
                '/receipts-images': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                },
            },
        },
        plugins: [react()],
        define: {

        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
                'ollama': path.resolve(__dirname, 'node_modules/ollama/dist/browser.mjs'),
            }
        }
    };
});
