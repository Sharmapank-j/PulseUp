// Vite build for the PulseUp Worker bundle (esm, workerd-compatible).
// Runs alongside the web build; output goes to dist-worker/ for sites_deploy.
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  // inline all dependencies: the Workers upload bundle cannot resolve bare imports
  ssr: { noExternal: true },
  build: {
    outDir: 'dist-worker',
    emptyOutDir: true,
    ssr: fileURLToPath(new URL('./worker/worker.ts', import.meta.url)),
    target: 'es2023',
    minify: false,
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: 'worker.js',
      },
    },
  },
})
