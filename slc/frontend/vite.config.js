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
  // In production:
  // - Set VITE_API_URL env variable to your backend URL (e.g., https://your-backend.onrender.com)
  // - Frontend will make requests to that URL
}));
