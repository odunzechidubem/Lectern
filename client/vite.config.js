import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// No more plugins are needed.

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/pdf-proxy': {
        target: 'https://res.cloudinary.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pdf-proxy/, ''),
      },
    },
  },
})