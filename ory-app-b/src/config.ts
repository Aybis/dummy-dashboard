/** Per-app settings. Everything environment-specific comes from VITE_* env vars. */
const env = import.meta.env

const trim = (v: string) => v.replace(/\/$/, '')

export const APP = {
  name: 'App B',
  /** Public origin of THIS app. Redirect URIs below are derived from it. */
  origin: trim(env.VITE_APP_URL || 'http://localhost:5175'),
  accent: '#059669',
  /** The sibling app, used only for the "check SSO" link. */
  otherApp: { name: 'App A', url: env.VITE_OTHER_APP_URL || 'http://localhost:5174/' },
}

/**
 * OpenID Connect settings for Thermis (Ory Hydra). Register this app in the Thermis
 * portal as a Single-page application: it is a *public* client (no client secret —
 * anything shipped to a browser is public), protected by PKCE.
 */
export const OIDC = {
  /** Hydra public URL = issuer. Discovery: {issuer}/.well-known/openid-configuration */
  issuer: trim(env.VITE_OIDC_ISSUER || 'http://localhost:4444'),
  /** client_id shown by the Thermis portal after registering the application. */
  clientId: env.VITE_OIDC_CLIENT_ID || '',
  scope: env.VITE_OIDC_SCOPE || 'openid profile email',
  /** Must be registered exactly as a redirect URI of the application in Thermis. */
  redirectUri: env.VITE_OIDC_REDIRECT_URI || `${trim(env.VITE_APP_URL || 'http://localhost:5175')}/callback`,
  /** Must be registered as a post-logout redirect URI of the application in Thermis. */
  postLogoutRedirectUri: env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI || `${trim(env.VITE_APP_URL || 'http://localhost:5175')}/`,
}
