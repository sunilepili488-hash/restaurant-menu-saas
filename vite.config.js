import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'staff-static',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/staff' || req.url === '/staff/') {
            req.url = '/staff/index.html';
          }
          if (req.url.startsWith('/staff/')) {
            const filePath = path.resolve(__dirname, 'public', req.url.slice(1));
            if (fs.existsSync(filePath)) {
              const ext = path.extname(filePath);
              const mimeTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
              };
              res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
      },
    },
    react(),
  ],
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
