import { useEffect, useState } from 'react'
import { APP, OIDC } from './config.ts'
import { OidcError, currentSession, discover, forget, login, logout, userinfo, type OidcSession } from './oidc.ts'

function Row({ k, v }: { k: string; v: unknown }) {
  return (
    <tr>
      <th>{k}</th>
      <td>{v === undefined || v === null || v === '' ? '—' : String(v)}</td>
    </tr>
  )
}

const time = (epochSeconds?: number) => (epochSeconds ? new Date(epochSeconds * 1000).toLocaleString() : undefined)

export function Profile() {
  const [session, setSession] = useState<OidcSession | null>(currentSession)
  const [info, setInfo] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const fail = (err: unknown) => {
    setBusy(false)
    setError({ message: err instanceof Error ? err.message : String(err), hint: err instanceof OidcError ? err.hint : undefined })
  }

  useEffect(() => {
    if (session) userinfo(session).then(setInfo).catch(fail)
    else discover().catch(fail) // surface a wrong issuer / Hydra down before the first click
  }, [session])

  const go = (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError(null)
    fn().catch(fail)
  }

  const errorBox = error && (
    <>
      <p className="msg error" data-testid="error">{error.message}</p>
      {error.hint && <p className="sub">{error.hint}</p>}
    </>
  )

  if (!session) {
    return (
      <section className="card">
        <h1>Belum login</h1>
        <p className="sub">Login diarahkan ke halaman login Thermis (Authorization Code + PKCE).</p>
        {errorBox}
        <div className="row">
          <button data-testid="login" disabled={busy} onClick={() => go(() => login())}>Login dengan Thermis</button>
          <button className="btn-link" disabled={busy} onClick={() => go(() => login({ prompt: 'login' }))}>Login ulang (prompt=login)</button>
        </div>
        <p className="alt">client_id: <code>{OIDC.clientId || '(VITE_OIDC_CLIENT_ID kosong)'}</code><br />redirect_uri: <code>{OIDC.redirectUri}</code></p>
      </section>
    )
  }

  const c = session.claims
  return (
    <section className="card wide">
      <h1>Detail login user</h1>
      <p className="msg ok" data-testid="signed-in">Login di {APP.name} via Thermis · ID token terverifikasi ✓</p>
      <table data-testid="identity">
        <tbody>
          <Row k="Email" v={info?.email ?? c.email} />
          <Row k="Name" v={info?.name ?? c.name} />
          <Row k="Subject (sub)" v={c.sub} />
          <Row k="Issuer (iss)" v={c.iss} />
          <Row k="Session ID (sid)" v={c.sid} />
          <Row k="Authenticated at" v={time(c.auth_time)} />
          <Row k="ID token expires" v={time(c.exp)} />
          <Row k="Scope granted" v={session.scope} />
          <Row k="Access token expires" v={new Date(session.expiresAt).toLocaleString()} />
        </tbody>
      </table>
      <details>
        <summary>ID token claims</summary>
        <pre>{JSON.stringify(c, null, 2)}</pre>
      </details>
      <details>
        <summary>GET /userinfo</summary>
        <pre data-testid="userinfo">{info ? JSON.stringify(info, null, 2) : 'loading…'}</pre>
      </details>
      {errorBox}
      <div className="row">
        <button data-testid="logout" disabled={busy} onClick={() => go(() => logout(session))}>Logout (SSO)</button>
        <button className="btn-link" onClick={() => { forget(); setSession(null); setInfo(null) }}>Logout lokal saja</button>
        <a className="btn-link" href={APP.otherApp.url} target="_blank" rel="noreferrer">Buka {APP.otherApp.name} (tes SSO) ↗</a>
      </div>
    </section>
  )
}
