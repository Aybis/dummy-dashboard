// This app's own backend and user database. Thermis (Hydra) answers "who is this person"; this
// server answers "is that person registered in THIS app". Every app has its own database.
import { createServer } from 'node:http'
import { mkdirSync, readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'

const APP_NAME = process.env.APP_NAME ?? 'App'
const PORT = Number(process.env.API_PORT ?? 4101)
const ISSUER = (process.env.OIDC_ISSUER ?? 'http://localhost:4444').replace(/\/$/, '')

mkdirSync(new URL('./data/', import.meta.url), { recursive: true })
const db = new DatabaseSync(new URL('./data/app.db', import.meta.url).pathname)
db.exec(`CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','member','viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
)`)
const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'))
const upsert = db.prepare(`INSERT INTO users (email, display_name, role, status) VALUES (?, ?, ?, ?)
  ON CONFLICT(email) DO UPDATE SET display_name = excluded.display_name, role = excluded.role, status = excluded.status`)
for (const u of seed) upsert.run(u.email.toLowerCase(), u.name, u.role, u.status ?? 'active')

const find = db.prepare('SELECT email, display_name AS name, role, status, registered_at AS registeredAt, last_login_at AS lastLoginAt FROM users WHERE email = ?')
const touch = db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE email = ?")
const all = db.prepare('SELECT email, display_name AS name, role, status, registered_at AS registeredAt, last_login_at AS lastLoginAt FROM users ORDER BY role, email')

/** Ask Thermis who owns this access token (Hydra /userinfo). Returns the verified claims or null. */
async function whoIs(authorization) {
  if (!authorization?.startsWith('Bearer ')) return null
  try {
    const res = await fetch(`${ISSUER}/userinfo`, { headers: { authorization } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

createServer(async (req, res) => {
  const path = new URL(req.url ?? '/', 'http://x').pathname
  if (path === '/api/health') return send(res, 200, { ok: true, app: APP_NAME })
  if (path !== '/api/me' && path !== '/api/users') return send(res, 404, { error: 'not_found' })

  const claims = await whoIs(req.headers.authorization)
  if (!claims?.email) return send(res, 401, { error: 'invalid_token', message: 'Token is missing, expired or has no e-mail claim.' })
  const email = String(claims.email).toLowerCase()
  const user = find.get(email)
  // Authenticated by Thermis, but not (or no longer) allowed into this application.
  if (!user) return send(res, 403, { error: 'not_registered', email, message: `${email} is not registered in ${APP_NAME}.` })
  if (user.status !== 'active') return send(res, 403, { error: 'disabled', email, message: `Your ${APP_NAME} account is disabled.` })

  if (path === '/api/users') {
    if (user.role !== 'admin') return send(res, 403, { error: 'forbidden', message: 'Admins only.' })
    return send(res, 200, { users: all.all() })
  }
  touch.run(email)
  return send(res, 200, { app: APP_NAME, user: find.get(email) })
}).listen(PORT, '127.0.0.1', () => console.log(`${APP_NAME} API on http://127.0.0.1:${PORT} (${seed.length} registered users)`))
