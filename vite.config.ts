import { defineConfig } from 'vite';
import path from "path";

export default defineConfig({
  server: {
    port: 4000,
    host: "0.0.0.0",
    hmr: true

  },
  resolve : {
      alias: {
        "@": path.resolve(__dirname, './src'),
      }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  root: './',
    publicDir: './public/www',
  build: {
    rollupOptions: {
      input: './public/main.ts'
    }
  }
});
