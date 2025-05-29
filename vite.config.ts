import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})