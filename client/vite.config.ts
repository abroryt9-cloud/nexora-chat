import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@nexora/shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5173,
    host: true, // Listen on all addresses
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable source maps for debugging
    minify: 'esbuild',
    commonjsOptions: {
      include: [/shared/, /node_modules/],
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
