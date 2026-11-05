import { createRoot } from 'react-dom/client'
import './index.css'
import { APP } from './config.ts'
import App from './App.tsx'

document.documentElement.style.setProperty('--accent', APP.accent)

// No <StrictMode>: the OIDC callback must run exactly once (the authorization code is single use).
createRoot(document.getElementById('root')!).render(<App />)
