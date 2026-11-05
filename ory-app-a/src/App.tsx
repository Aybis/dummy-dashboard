import { useCallback, useEffect, useState } from 'react'
import { APP } from './config.ts'
import { AuthPage } from './AuthPage.tsx'
import { Profile } from './Profile.tsx'

/** Hash routing keeps this a pure static SPA: no server rewrites needed. */
function useRoute() {
  const read = () => window.location.hash.replace(/^#/, '').split('?')[0] || '/profile'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((to: string) => {
    window.location.hash = to
    setRoute(to.split('?')[0])
  }, [])
  return { route, go }
}

export default function App() {
  const { route, go } = useRoute()
  return (
    <>
      <header>
        <strong>{APP.name}</strong>
        <span className="tag">Ory Kratos test</span>
        <nav>
          <a href="#/profile">Profile</a>
          <a href="#/login">Login</a>
          {APP.registerEnabled && <a href="#/register">Daftar</a>}
        </nav>
      </header>
      <main>
        {route === '/login' && <AuthPage mode="login" go={go} />}
        {route === '/register' && APP.registerEnabled && <AuthPage mode="register" go={go} />}
        {(route === '/profile' || route === '/' || (route === '/register' && !APP.registerEnabled)) && <Profile go={go} />}
        {!['/login', '/register', '/profile', '/'].includes(route) && <Profile go={go} />}
      </main>
    </>
  )
}
