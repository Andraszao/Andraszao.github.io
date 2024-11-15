import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/Andraszao/Andraszao.github.io/',  // since you're using username.github.io
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});