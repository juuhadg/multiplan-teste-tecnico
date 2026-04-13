import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['localhost', '127.0.0.1','1614-2804-7f0-6540-3eb6-5892-f885-87da-c6ea.ngrok-free.app'],
  },
})
