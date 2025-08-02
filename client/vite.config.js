import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [ { src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js', dest: '' } ]
    })
  ],
  server: {
    proxy: {
      '/api': {
        // --- THIS IS THE CRITICAL CHANGE ---
        target: 'https://lectern-usqo.onrender.com', // <-- Use your live Render URL
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