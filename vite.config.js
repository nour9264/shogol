import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true // Show error overlay in browser
    },
    watch: {
      usePolling: false // For better HMR performance
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Enable Fast Refresh (HMR) for React
  esbuild: {
    jsx: 'automatic'
  }
})

