/** Per-app settings. Everything environment-specific comes from VITE_* env vars. */
const env = import.meta.env

export const APP = {
  name: 'App B',
  /** Public origin of THIS app. Must be in Kratos `allowed_return_urls` + CORS origins. */
  origin: (env.VITE_APP_URL || 'http://localhost:5175').replace(/\/$/, ''),
  accent: '#059669',
  /** Show the sign-up page. Set VITE_REGISTER_ENABLED=false if sign-up lives elsewhere. */
  registerEnabled: (env.VITE_REGISTER_ENABLED || 'false') === 'true',
  /** The sibling app, used only for the "check the shared session" link. */
  otherApp: { name: 'App A', url: env.VITE_OTHER_APP_URL || 'http://localhost:5174/' },
}

/**
 * Base URL of your Ory identity server (Kratos public API / Ory Network SDK URL).
 * Browser flows rely on cookies, so this must be same-site with the app —
 * for Ory Network in local dev, run `ory tunnel` and point this at the tunnel.
 */
export const KRATOS_URL: string = (env.VITE_KRATOS_URL || 'http://localhost:4433').replace(/\/$/, '')
