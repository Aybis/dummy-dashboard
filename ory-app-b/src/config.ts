/** Per-app settings. Everything environment-specific comes from VITE_* env vars (all public). */
const env = import.meta.env

const origin = (env.VITE_APP_URL || 'http://localhost:5175').replace(/\/$/, '')

export const APP = {
  name: 'App B',
  origin,
  accent: '#059669',
  /** The sibling app, used only for the "check the shared session" link. */
  otherApp: { name: 'App A', url: env.VITE_OTHER_APP_URL || 'http://localhost:5174/' },
}

/** OpenID Connect settings for Thermis (Ory Hydra). SPA = public client: no secret, PKCE only. */
export const OIDC = {
  /** Hydra public URL. Endpoints are discovered from {issuer}/.well-known/openid-configuration. */
  issuer: (env.VITE_OIDC_ISSUER || 'http://localhost:4444').replace(/\/$/, ''),
  /** client_id of this app, shown in the Thermis portal after creating the application. */
  clientId: (env.VITE_OIDC_CLIENT_ID || '') as string,
  redirectUri: env.VITE_OIDC_REDIRECT_URI || `${origin}/callback`,
  postLogoutRedirectUri: env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI || `${origin}/`,
  scope: env.VITE_OIDC_SCOPE || 'openid profile email offline_access',
}
