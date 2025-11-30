import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/frontend/' : '/',
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true
    }
  }
})
