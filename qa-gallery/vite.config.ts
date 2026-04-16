import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/qa/',
  server: { port: 5180, strictPort: true },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../packages/core/src'),
    },
  },
});
