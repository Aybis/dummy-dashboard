import { OIDC } from './config.ts'

/**
 * Minimal OIDC Authorization Code + PKCE client for a public SPA (no dependencies, WebCrypto only).
 * Tokens live in sessionStorage: they vanish when the tab closes. SSO between apps comes from the
 * Hydra session cookie, not from anything stored here.
 */

type Discovery = {
  authorization_endpoint: string
  token_endpoint: string
  end_session_endpoint?: string
}

export type Tokens = {
  id_token: string
  access_token: string
  refresh_token?: string
  expires_at: number
}

export type Claims = Record<string, unknown> & { sub: string; email?: string; name?: string; exp?: number; iat?: number }

const TOKENS_KEY = 'oidc.tokens'
const PENDING_KEY = 'oidc.pending'

let discoveryCache: Promise<Discovery> | undefined

function discover(): Promise<Discovery> {
  discoveryCache ??= fetch(`${OIDC.issuer}/.well-known/openid-configuration`).then((r) => {
    if (!r.ok) throw new Error(`OIDC discovery failed (${r.status}) at ${OIDC.issuer}`)
    return r.json() as Promise<Discovery>
  })
  return discoveryCache
}

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomString(bytes = 32): string {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)))
}

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))
}

export function decodeJwt(jwt: string): Claims {
  const payload = jwt.split('.')[1] ?? ''
  const json = decodeURIComponent(
    atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  )
  return JSON.parse(json) as Claims
}

/** Step 1: redirect the browser to Hydra, which hands over to the Thermis login app. */
export async function login(): Promise<void> {
  if (!OIDC.clientId) throw new Error('VITE_OIDC_CLIENT_ID is empty: set it in .env.local and restart `npm run dev`.')
  const d = await discover()
  const state = randomString()
  const verifier = randomString(48)
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ state, verifier }))
  const url = new URL(d.authorization_endpoint)
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: OIDC.clientId,
    redirect_uri: OIDC.redirectUri,
    scope: OIDC.scope,
    state,
    code_challenge: b64url(await sha256(verifier)),
    code_challenge_method: 'S256',
  }).toString()
  window.location.assign(url.toString())
}

/** Step 2 (on /callback): swap the one-time code for tokens. Returns the claims of the id_token. */
export async function handleCallback(search: string): Promise<Claims> {
  const params = new URLSearchParams(search)
  const error = params.get('error')
  if (error) throw new Error(`${error}: ${params.get('error_description') ?? 'sign-in was refused'}`)
  const code = params.get('code')
  const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null') as { state: string; verifier: string } | null
  sessionStorage.removeItem(PENDING_KEY)
  if (!code || !pending) throw new Error('No sign-in in progress (missing code or state). Start again from Login.')
  if (params.get('state') !== pending.state) throw new Error('State mismatch: the response does not belong to this sign-in.')

  const d = await discover()
  const res = await fetch(d.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: OIDC.redirectUri,
      client_id: OIDC.clientId,
      code_verifier: pending.verifier,
    }),
  })
  const body = (await res.json()) as Partial<Tokens> & { expires_in?: number; error?: string; error_description?: string }
  if (!res.ok || !body.id_token || !body.access_token) {
    throw new Error(`Token exchange failed: ${body.error ?? res.status} ${body.error_description ?? ''}`.trim())
  }
  const tokens: Tokens = {
    id_token: body.id_token,
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_at: Date.now() + (body.expires_in ?? 3600) * 1000,
  }
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  return decodeJwt(tokens.id_token)
}

export function getTokens(): Tokens | null {
  try {
    return JSON.parse(sessionStorage.getItem(TOKENS_KEY) ?? 'null') as Tokens | null
  } catch {
    return null
  }
}

/** Ends the Hydra SSO session too, so the other app is also signed out. */
export async function logout(): Promise<void> {
  const tokens = getTokens()
  sessionStorage.removeItem(TOKENS_KEY)
  const d = await discover()
  if (!d.end_session_endpoint) {
    window.location.assign(OIDC.postLogoutRedirectUri)
    return
  }
  const url = new URL(d.end_session_endpoint)
  const params = new URLSearchParams({ post_logout_redirect_uri: OIDC.postLogoutRedirectUri })
  if (tokens) params.set('id_token_hint', tokens.id_token)
  url.search = params.toString()
  window.location.assign(url.toString())
}
