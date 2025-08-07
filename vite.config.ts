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
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: "tj-alpha",
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es' as const],
    }
  }
});
