import { getTokens } from './oidc.ts'

/** A user of THIS app, from the app's own database (not from the identity provider). */
export type AppUser = {
  email: string
  name: string
  role: 'admin' | 'member' | 'viewer'
  status: string
  registeredAt: string
  lastLoginAt: string | null
}

export type MeResult =
  | { ok: true; user: AppUser }
  | { ok: false; reason: 'not_registered' | 'disabled' | 'unauthorized' | 'unreachable'; message: string }

async function call(path: string): Promise<Response> {
  const token = getTokens()?.access_token
  return fetch(path, { headers: token ? { authorization: `Bearer ${token}` } : {} })
}

/** Asks this app's backend whether the signed-in person is registered here. */
export async function fetchMe(): Promise<MeResult> {
  try {
    const res = await call('/api/me')
    const body = (await res.json()) as { user?: AppUser; error?: string; message?: string }
    if (res.ok && body.user) return { ok: true, user: body.user }
    const reason = body.error === 'not_registered' || body.error === 'disabled' ? body.error : res.status === 401 ? 'unauthorized' : 'unreachable'
    return { ok: false, reason, message: body.message ?? `HTTP ${res.status}` }
  } catch {
    return { ok: false, reason: 'unreachable', message: 'Backend aplikasi tidak terjangkau. Jalankan `npm run api`.' }
  }
}

export async function fetchUsers(): Promise<AppUser[]> {
  const res = await call('/api/users')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return ((await res.json()) as { users: AppUser[] }).users
}
