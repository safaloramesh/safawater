import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '', // This ensures assets load via ./assets/ instead of /assets/
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
