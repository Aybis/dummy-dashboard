import { createRoot } from 'react-dom/client'
import './index.css'
import { APP } from './config.ts'
import App from './App.tsx'

document.documentElement.style.setProperty('--accent', APP.accent)

// Deliberately no <StrictMode>: its double-invoked effects would redeem the one-time
// authorization code twice, and Hydra revokes the tokens when a code is reused.
createRoot(document.getElementById('root')!).render(<App />)
