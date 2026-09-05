import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: false,
    allowedHosts: ['itms.cloudafk.xyz'],

    proxy: {
      '/api': {
        target: 'http://127.0.0.1:30001',
        changeOrigin: true,
      },
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: false,
    allowedHosts: ['itms.cloudafk.xyz'],
  },
})