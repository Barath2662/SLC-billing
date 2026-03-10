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
    },
  },
  // In production, VITE_API_URL should be your Railway/Render backend URL e.g. https://my-backend.railway.app
  // Leave empty to use same-origin relative /api paths
}));
