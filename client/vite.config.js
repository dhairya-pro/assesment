import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const port = Number(process.env.PORT) || 5173

// No @vitejs/plugin-react — it injects $RefreshSig$ in dev, which breaks on Render
// when the app is served without Vite's full dev runtime. JSX uses esbuild only.
export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    host: '0.0.0.0',
    port,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
  },
})
