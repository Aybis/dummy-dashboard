import { createRoot } from 'react-dom/client'
import './index.css'
import { APP } from './config.ts'
import App from './App.tsx'

document.documentElement.style.setProperty('--accent', APP.accent)

// Deliberately no <StrictMode>: its double-invoked effects would create two
// Kratos flows at once and the second CSRF cookie would invalidate the first.
createRoot(document.getElementById('root')!).render(<App />)
