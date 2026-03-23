import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all addresses
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable source maps for debugging
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
      },
    },
  },
  preview: {
    port: parseInt(process.env.PORT || '10000'),
    host: true, // Required for Render
  },
  define: {
    'process.env': {}, // Fix for Vite 4+
  },
});
