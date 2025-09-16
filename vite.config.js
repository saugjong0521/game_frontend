import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'game.kstadium.io',
      'gameapi.kstadium.io',
      'localhost',
      '127.0.0.1',
      '192.168.95.14'
    ]
  },
  build: {
    assetsInlineLimit: 0
  }
});
