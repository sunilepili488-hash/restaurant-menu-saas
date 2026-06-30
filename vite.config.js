import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'tanstack-query': ['@tanstack/react-query'],
          'ui-lib': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
