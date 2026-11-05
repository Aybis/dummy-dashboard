import { useCallback, useEffect, useState } from 'react'
import { APP } from './config.ts'
import { logout } from './oidc.ts'
import { useSession } from './useSession.ts'
import { Home } from './Home.tsx'
import { Login } from './Login.tsx'
import { Profile } from './Profile.tsx'
import { Users } from './Users.tsx'
import { Denied } from './Denied.tsx'

/** Hash routing keeps this a pure static SPA: no server rewrites needed. */
function useRoute() {
  const read = () => window.location.hash.replace(/^#/, '').split('?')[0] || '/home'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((to: string) => {
    window.location.hash = to
  }, [])
  return { route, go }
}

export default function App() {
  const { state } = useSession()
  const { route, go } = useRoute()

  if (state.status === 'denied') {
    return (
      <>
        <header>
          <strong>{APP.name}</strong>
          <span className="tag">Thermis OIDC test</span>
        </header>
        <main><Denied claims={state.claims} reason={state.reason} /></main>
      </>
    )
  }

  if (state.status !== 'authenticated') {
    return (
      <>
        <header>
          <strong>{APP.name}</strong>
          <span className="tag">Thermis OIDC test</span>
        </header>
        <main>{state.status === 'loading' ? <section className="card"><p className="sub">Memeriksa login…</p></section> : <Login error={state.status === 'error' ? state.message : undefined} />}</main>
      </>
    )
  }

  const { claims, expiresAt, user } = state
  const name = user.name
  const initials = name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('')
  const isAdmin = user.role === 'admin'
  const active = route === '/profile' ? 'profile' : route === '/users' && isAdmin ? 'users' : 'home'

  return (
    <>
      <header>
        <strong>{APP.name}</strong>
        <nav>
          <a href="#/home" className={active === 'home' ? 'active' : ''}>Home</a>
          <a href="#/profile" className={active === 'profile' ? 'active' : ''}>Profile</a>
          {isAdmin && <a href="#/users" className={active === 'users' ? 'active' : ''}>Users</a>}
        </nav>
        <div className="user">
          <span className="avatar" aria-hidden="true">{initials}</span>
          <span className="who">{name}</span>
          <button className="ghost" onClick={() => void logout()}>Logout</button>
        </div>
      </header>
      <main>
        {active === 'profile' ? <Profile claims={claims} expiresAt={expiresAt} user={user} /> : active === 'users' ? <Users /> : <Home claims={claims} expiresAt={expiresAt} user={user} go={go} />}
      </main>
    </>
  )
}
