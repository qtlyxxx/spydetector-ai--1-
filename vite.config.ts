import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        // Ensure sw.js is included in the build or just copy it
      }
    }
  },
  // Ensure the service worker is copied to the root of the dist folder
  publicDir: 'public', 
})