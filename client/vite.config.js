import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
          dest: ''
        }
      ]
    })
  ],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/pdf-proxy': {
        target: 'https://res.cloudinary.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pdf-proxy/, ''),
      },
    },
  },
})