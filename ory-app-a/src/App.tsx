import { useEffect, useState } from 'react'
import { APP, OIDC } from './config.ts'
import { OidcError, handleCallback, isCallback } from './oidc.ts'
import { Profile } from './Profile.tsx'

type Callback = { phase: 'none' } | { phase: 'busy' } | { phase: 'error'; message: string; hint?: string }

export default function App() {
  const [cb, setCb] = useState<Callback>(isCallback() ? { phase: 'busy' } : { phase: 'none' })

  useEffect(() => {
    if (!isCallback()) return
    handleCallback()
      .then(() => {
        // Drop ?code=&state= from the address bar and history.
        window.history.replaceState(null, '', '/#/profile')
        setCb({ phase: 'none' })
      })
      .catch((err: unknown) => setCb({ phase: 'error', message: err instanceof Error ? err.message : String(err), hint: err instanceof OidcError ? err.hint : undefined }))
  }, [])

  return (
    <>
      <header>
        <strong>{APP.name}</strong>
        <span className="tag">OIDC client · Thermis ({OIDC.issuer})</span>
      </header>
      <main>
        {cb.phase === 'busy' && <section className="card"><p className="sub">Menukar authorization code dengan token…</p></section>}
        {cb.phase === 'error' && (
          <section className="card">
            <h1>Login gagal</h1>
            <p className="msg error" data-testid="callback-error">{cb.message}</p>
            {cb.hint && <p className="sub">{cb.hint}</p>}
            <button onClick={() => { window.history.replaceState(null, '', '/'); setCb({ phase: 'none' }) }}>Kembali</button>
          </section>
        )}
        {cb.phase === 'none' && <Profile />}
      </main>
    </>
  )
}
