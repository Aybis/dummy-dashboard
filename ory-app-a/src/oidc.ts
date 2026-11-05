import { OIDC } from './config.ts'

/**
 * Minimal OpenID Connect client: Authorization Code flow + PKCE (S256) for a public SPA.
 * Written out by hand (no library) so every step of the Thermis/Hydra flow is visible:
 *
 *   1. login()          -> redirect to {issuer}/oauth2/auth            (Thermis login page)
 *   2. handleCallback() <- {redirect_uri}?code=...&state=...
 *                       -> POST {issuer}/oauth2/token (code + code_verifier)
 *                       -> validate the ID token (signature, iss, aud, exp, nonce)
 *   3. userinfo()       -> GET {issuer}/userinfo with the access token
 *   4. logout()         -> redirect to {issuer}/oauth2/sessions/logout (RP-initiated logout)
 *
 * Tokens are kept in sessionStorage (per tab) — fine for a test app. A production SPA
 * should prefer a backend-for-frontend so tokens never reach JavaScript.
 */

export interface Discovery {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  jwks_uri: string
  end_session_endpoint?: string
}

export interface IdClaims {
  iss: string
  sub: string
  aud: string | string[]
  exp: number
  iat: number
  nonce?: string
  auth_time?: number
  sid?: string
  email?: string
  name?: string
  [k: string]: unknown
}

export interface OidcSession {
  idToken: string
  accessToken: string
  refreshToken?: string
  tokenType: string
  scope: string
  expiresAt: number
  claims: IdClaims
}

interface Transaction {
  state: string
  nonce: string
  verifier: string
}

const TX_KEY = 'oidc.tx'
const SESSION_KEY = 'oidc.session'

/** Error with a hint aimed at whoever is setting up the test. */
export class OidcError extends Error {
  readonly hint?: string
  constructor(message: string, hint?: string) {
    super(message)
    this.hint = hint
  }
}

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const random = (n = 32) => b64url(crypto.getRandomValues(new Uint8Array(n)))
const b64urlDecode = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0))

const CORS_HINT =
  'The browser blocked the call (CORS) or Hydra is down. In Thermis, add this app\'s origin to the application\'s "Allowed CORS origins", and make sure Hydra serve.public.cors is enabled.'

async function call(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch {
    throw new OidcError(`Request to ${new URL(url).origin}${new URL(url).pathname} failed`, CORS_HINT)
  }
}

let discovery: Promise<Discovery> | null = null
export function discover(): Promise<Discovery> {
  discovery ??= call(`${OIDC.issuer}/.well-known/openid-configuration`)
    .then(async (r) => {
      if (!r.ok) throw new OidcError(`Discovery returned HTTP ${r.status}`, `Is VITE_OIDC_ISSUER (${OIDC.issuer}) the Hydra public URL?`)
      return (await r.json()) as Discovery
    })
    .catch((e) => {
      discovery = null
      throw e
    })
  return discovery
}

function assertConfigured() {
  if (!OIDC.clientId) throw new OidcError('VITE_OIDC_CLIENT_ID is empty', 'Register this app in the Thermis portal and put its client_id in .env.local, then restart `npm run dev`.')
}

/** Step 1: send the browser to Thermis. `prompt: 'login'` forces the sign-in page even with an SSO session. */
export async function login(opts: { prompt?: 'login' | 'none'; loginHint?: string } = {}): Promise<never> {
  assertConfigured()
  const d = await discover()
  const tx: Transaction = { state: random(), nonce: random(), verifier: random(48) }
  sessionStorage.setItem(TX_KEY, JSON.stringify(tx))
  const challenge = b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tx.verifier))))
  const url = new URL(d.authorization_endpoint)
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: OIDC.clientId,
    redirect_uri: OIDC.redirectUri,
    scope: OIDC.scope,
    state: tx.state,
    nonce: tx.nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    ...(opts.prompt ? { prompt: opts.prompt } : {}),
    ...(opts.loginHint ? { login_hint: opts.loginHint } : {}),
  }).toString()
  window.location.assign(url.href)
  return new Promise<never>(() => {})
}

export const isCallback = () => window.location.pathname === new URL(OIDC.redirectUri).pathname

/** Step 2: exchange the authorization code for tokens and validate the ID token. */
export async function handleCallback(): Promise<OidcSession> {
  const params = new URLSearchParams(window.location.search)
  const txRaw = sessionStorage.getItem(TX_KEY)
  sessionStorage.removeItem(TX_KEY)
  const error = params.get('error')
  if (error) {
    const desc = params.get('error_description') ?? ''
    throw new OidcError(`${error}${desc ? `: ${desc}` : ''}`, error === 'access_denied' ? 'Thermis refused the sign-in (see the message above), or the user denied consent.' : undefined)
  }
  const tx = txRaw ? (JSON.parse(txRaw) as Transaction) : null
  if (!tx || params.get('state') !== tx.state) throw new OidcError('State mismatch: this callback does not belong to a sign-in started in this tab', 'Start the login again from this tab.')
  const code = params.get('code')
  if (!code) throw new OidcError('The callback has no authorization code')

  const d = await discover()
  const res = await call(d.token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: OIDC.redirectUri, client_id: OIDC.clientId, code_verifier: tx.verifier }),
  })
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new OidcError(`Token endpoint: ${String(body.error ?? res.status)}${body.error_description ? ` — ${String(body.error_description)}` : ''}`,
      body.error === 'invalid_client' ? 'Is the Thermis application registered as a Single-page application (token endpoint auth method "none")?' : undefined)
  }
  const idToken = String(body.id_token ?? '')
  if (!idToken) throw new OidcError('No id_token in the token response', 'Request the "openid" scope and allow it for the application in Thermis.')
  const claims = await verifyIdToken(idToken, d, tx.nonce)
  const session: OidcSession = {
    idToken,
    accessToken: String(body.access_token),
    refreshToken: body.refresh_token ? String(body.refresh_token) : undefined,
    tokenType: String(body.token_type ?? 'bearer'),
    scope: String(body.scope ?? ''),
    expiresAt: Date.now() + Number(body.expires_in ?? 3600) * 1000,
    claims,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

/** Signature (RS256/ES256 via the issuer's JWKS) + iss, aud, exp and nonce. */
async function verifyIdToken(jwt: string, d: Discovery, nonce: string): Promise<IdClaims> {
  const [h, p, s] = jwt.split('.')
  if (!h || !p || !s) throw new OidcError('Malformed ID token')
  const header = JSON.parse(new TextDecoder().decode(b64urlDecode(h))) as { alg: string; kid?: string }
  const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(p))) as IdClaims

  const jwks = (await (await call(d.jwks_uri)).json()) as { keys: (JsonWebKey & { kid?: string })[] }
  const jwk = jwks.keys.find((k) => !header.kid || k.kid === header.kid)
  if (!jwk) throw new OidcError(`No signing key '${header.kid}' in ${d.jwks_uri}`)
  const algo =
    header.alg === 'RS256' ? { import: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, verify: { name: 'RSASSA-PKCS1-v1_5' } }
    : header.alg === 'ES256' ? { import: { name: 'ECDSA', namedCurve: 'P-256' }, verify: { name: 'ECDSA', hash: 'SHA-256' } }
    : null
  if (!algo) throw new OidcError(`Unsupported ID token algorithm ${header.alg}`)
  const key = await crypto.subtle.importKey('jwk', { ...jwk, alg: undefined, key_ops: undefined, use: undefined } as JsonWebKey, algo.import, false, ['verify'])
  const ok = await crypto.subtle.verify(algo.verify, key, b64urlDecode(s), new TextEncoder().encode(`${h}.${p}`))
  if (!ok) throw new OidcError('ID token signature is invalid')

  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (claims.iss !== d.issuer) throw new OidcError(`ID token issuer ${claims.iss} ≠ ${d.issuer}`)
  if (!aud.includes(OIDC.clientId)) throw new OidcError('ID token audience does not contain this client_id')
  if (claims.exp * 1000 < Date.now() - 60_000) throw new OidcError('ID token expired')
  if (claims.nonce !== nonce) throw new OidcError('ID token nonce mismatch')
  return claims
}

export function currentSession(): OidcSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  const s = JSON.parse(raw) as OidcSession
  if (s.expiresAt < Date.now()) {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
  return s
}

/** Step 3: what Thermis says about the user (claims released by the granted scopes). */
export async function userinfo(session: OidcSession): Promise<Record<string, unknown>> {
  const d = await discover()
  const res = await call(d.userinfo_endpoint, { headers: { authorization: `Bearer ${session.accessToken}` } })
  if (!res.ok) throw new OidcError(`userinfo returned HTTP ${res.status}`)
  return (await res.json()) as Record<string, unknown>
}

/**
 * Step 4: RP-initiated logout. Ends the Thermis/Hydra SSO session (so App B is signed out
 * too) and comes back to the post-logout redirect URI.
 */
export async function logout(session: OidcSession | null): Promise<never> {
  sessionStorage.removeItem(SESSION_KEY)
  const d = await discover()
  if (!d.end_session_endpoint || !session) {
    window.location.assign(OIDC.postLogoutRedirectUri)
    return new Promise<never>(() => {})
  }
  const url = new URL(d.end_session_endpoint)
  url.search = new URLSearchParams({ id_token_hint: session.idToken, post_logout_redirect_uri: OIDC.postLogoutRedirectUri, state: random(16) }).toString()
  window.location.assign(url.href)
  return new Promise<never>(() => {})
}

/** Local sign-out only (keeps the SSO session at Thermis). */
export function forget() {
  sessionStorage.removeItem(SESSION_KEY)
}
