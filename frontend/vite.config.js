import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/_/backend': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_\/backend/, ''),
      },
    },
  },
  // In production on Vercel:
  // - Frontend is at / and requests go to /_/backend (handled by Vercel routing)
  // - Set VITE_API_URL to /_/backend in frontend env
}));
