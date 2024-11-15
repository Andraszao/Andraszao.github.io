import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',  // If using username.github.io repository
  // OR
  // base: '/repository-name/',  // If using any other repository name
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});