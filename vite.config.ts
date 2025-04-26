import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4000,
    host: "0.0.0.0",
    hmr: true
  },
    resolve : {
        alias: {
          '@': '/src'
        }
    },
  root: './',
  publicDir: './www',
  build: {
    rollupOptions: {
      input: './www/www.ts'
    }
  },

  test: {
    globals: true,
    inspect: "0.0.0.0:9229",

    environment: 'jsdom'
  }
});
