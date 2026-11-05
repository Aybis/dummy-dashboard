import { useCallback, useEffect, useState } from 'react'
import { decodeJwt, getTokens, handleCallback, type Claims } from './oidc.ts'
import { fetchMe, type AppUser } from './api.ts'

export type SessionState =
  | { status: 'loading' }
  /** Signed in at Thermis AND registered in this app: may see the homepage. */
  | { status: 'authenticated'; claims: Claims; expiresAt: number; user: AppUser }
  /** Signed in at Thermis, but not (or no longer) allowed into this app. */
  | { status: 'denied'; claims: Claims; reason: 'not_registered' | 'disabled'; message: string }
  | { status: 'anonymous' }
  | { status: 'error'; message: string }

/** Completes the login on /callback, then asks this app's backend whether the user is registered. */
export function useSession() {
  const [state, setState] = useState<SessionState>({ status: 'loading' })

  const refresh = useCallback(async () => {
    try {
      if (window.location.pathname === '/callback') {
        const search = window.location.search
        // Remove ?code=… from the address bar right away (the code is single use) and land on the homepage.
        window.history.replaceState(null, '', '/#/home')
        await handleCallback(search)
      }
      const tokens = getTokens()
      if (!tokens || tokens.expires_at < Date.now()) return setState({ status: 'anonymous' })
      const claims = decodeJwt(tokens.id_token)
      const me = await fetchMe()
      if (me.ok) return setState({ status: 'authenticated', claims, expiresAt: tokens.expires_at, user: me.user })
      if (me.reason === 'not_registered' || me.reason === 'disabled') return setState({ status: 'denied', claims, reason: me.reason, message: me.message })
      setState({ status: 'error', message: me.message })
    } catch (err) {
      setState({ status: 'error', message: (err as Error).message })
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { state, refresh }
}

/** Claims arrive as a string or a list depending on the provider: always give back a list. */
export function asList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : typeof v === 'string' ? [v] : []
}
