import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Port is fixed: Kratos CORS + allowed_return_urls whitelist exactly this origin.
export default defineConfig({
  plugins: [react()],
  server: { port: 5175, strictPort: true },
  preview: { port: 5175, strictPort: true },
})
