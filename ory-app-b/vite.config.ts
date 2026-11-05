import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Port is fixed: the redirect URI and CORS origin registered in Thermis name this exact origin.
export default defineConfig({
  plugins: [react()],
  server: { port: 5175, strictPort: true },
  preview: { port: 5175, strictPort: true },
})
