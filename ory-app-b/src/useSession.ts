import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@ory/client'
import { httpStatus, errorText, ory } from './ory.ts'

export type SessionState =
  | { status: 'loading' }
  | { status: 'authenticated'; session: Session }
  | { status: 'anonymous' } // whoami -> 401
  | { status: 'error'; message: string } // Kratos unreachable / CORS / etc.

/** Calls GET /sessions/whoami (ory.toSession) with the browser cookie. */
export function useSession() {
  const [state, setState] = useState<SessionState>({ status: 'loading' })

  const refresh = useCallback(async () => {
    try {
      const { data } = await ory.toSession()
      setState({ status: 'authenticated', session: data })
    } catch (err) {
      if (httpStatus(err) === 401) setState({ status: 'anonymous' })
      else setState({ status: 'error', message: errorText(err) })
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { state, refresh }
}
