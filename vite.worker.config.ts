import { defineConfig } from 'vite'
import worker from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [worker()],
  build: {
    outDir: 'dist-worker',
    target: 'es2022',
    minify: 'esbuild',
  },
})
