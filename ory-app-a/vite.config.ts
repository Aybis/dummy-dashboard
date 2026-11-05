import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Port is fixed: Kratos CORS + allowed_return_urls whitelist exactly this origin.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true, proxy: { '/api': 'http://127.0.0.1:4101' } },
  preview: { port: 5174, strictPort: true },
})
