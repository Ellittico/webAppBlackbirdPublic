import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  define: {
    global: "globalThis",
    "process.env": {},
  },
  resolve: {
    alias: {
      events: "events",
      stream: "stream-browserify",
      buffer: "buffer",
      process: "process/browser",
      util: "util",
    },
  },
  optimizeDeps: {
    include: ["buffer", "process", "stream-browserify", "events", "util"],
  },
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
})
