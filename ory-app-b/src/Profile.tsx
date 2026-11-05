import { useState } from 'react'
import { APP } from './config.ts'
import { errorText, httpStatus, ory } from './ory.ts'
import { useSession } from './useSession.ts'

type Logout = { phase: 'idle' } | { phase: 'busy' } | { phase: 'done'; whoamiStatus: number | string } | { phase: 'error'; message: string }

function Row({ k, v }: { k: string; v: string | undefined }) {
  return (
    <tr>
      <th>{k}</th>
      <td>{v ?? '—'}</td>
    </tr>
  )
}

export function Profile({ go }: { go: (to: string) => void }) {
  const { state, refresh } = useSession()
  const [logout, setLogout] = useState<Logout>({ phase: 'idle' })

  async function doLogout() {
    setLogout({ phase: 'busy' })
    try {
      const { data } = await ory.createBrowserLogoutFlow()
      await ory.updateLogoutFlow({ token: data.logout_token })
      // Proof the session is really gone server-side: whoami must now be 401.
      let whoamiStatus: number | string = 200
      try {
        await ory.toSession()
      } catch (err) {
        whoamiStatus = httpStatus(err) ?? 'network error'
      }
      setLogout({ phase: 'done', whoamiStatus })
    } catch (err) {
      setLogout({ phase: 'error', message: errorText(err) })
    }
  }

  if (logout.phase === 'done') {
    const ok = logout.whoamiStatus === 401
    return (
      <section className="card">
        <h1>Logout berhasil</h1>
        <p className={ok ? 'msg ok' : 'msg error'} data-testid="logout-result">
          GET /sessions/whoami → {logout.whoamiStatus} {ok ? '(session sudah tidak valid ✓)' : '(session MASIH aktif ✗)'}
        </p>
        <button onClick={() => { setLogout({ phase: 'idle' }); void refresh(); go('/login') }}>Ke halaman login</button>
      </section>
    )
  }

  if (state.status === 'loading') return <section className="card"><p className="sub">Memeriksa session…</p></section>

  if (state.status === 'error') {
    return (
      <section className="card">
        <h1>Kratos tidak terjangkau</h1>
        <p className="msg error">{state.message}</p>
        <p className="sub">Pastikan Kratos berjalan di http://localhost:4433 (lihat README).</p>
        <button onClick={() => void refresh()}>Coba lagi</button>
      </section>
    )
  }

  if (state.status === 'anonymous') {
    return (
      <section className="card">
        <h1>Belum login</h1>
        <p className="msg" data-testid="anonymous">GET /sessions/whoami → 401</p>
        <button onClick={() => go('/login')}>Login</button>
      </section>
    )
  }

  const { session } = state
  const identity = session.identity
  const traits = (identity?.traits ?? {}) as { email?: string; name?: string }
  return (
    <section className="card wide">
      <h1>Detail login user</h1>
      <p className="msg ok">Login di {APP.name} · GET /sessions/whoami → 200</p>
      <table data-testid="identity">
        <tbody>
          <Row k="Email" v={traits.email} />
          <Row k="Name" v={traits.name} />
          <Row k="Identity ID" v={identity?.id} />
          <Row k="Session ID" v={session.id} />
          <Row k="Authenticated at" v={session.authenticated_at} />
          <Row k="Expires at" v={session.expires_at} />
          <Row k="Auth level (AAL)" v={session.authenticator_assurance_level} />
          <Row k="Auth methods" v={session.authentication_methods?.map((m) => m.method).join(', ')} />
        </tbody>
      </table>
      <details>
        <summary>Raw session JSON</summary>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </details>
      {logout.phase === 'error' && <p className="msg error">{logout.message}</p>}
      <div className="row">
        <button onClick={doLogout} disabled={logout.phase === 'busy'}>
          {logout.phase === 'busy' ? 'Logging out…' : 'Logout'}
        </button>
        <a className="btn-link" href={APP.otherApp.url} target="_blank" rel="noreferrer">
          Buka {APP.otherApp.name} (cek session sama) ↗
        </a>
      </div>
    </section>
  )
}
