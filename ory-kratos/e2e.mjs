// End-to-end check of the whole Ory flow through the real UIs.
// Prereq: Kratos on :4433, app A on :5174, app B on :5175.
// Run:  NODE_PATH=$(npm root -g) node e2e.mjs      (needs `playwright` installed)
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')

const A = 'http://localhost:5174/'
const B = 'http://localhost:5175/'
const email = `tester+${Date.now()}@example.com`
const password = 'Sup3r-secret-pass-' + Date.now()
let n = 0
const ok = (m) => console.log(`✓ ${++n}. ${m}`)
const assert = (c, m) => { if (!c) { console.error(`✗ FAILED: ${m}`); process.exitCode = 1; throw new Error(m) } ok(m) }

const browser = await chromium.launch()
const ctx = await browser.newContext()
const a = await ctx.newPage()
const b = await ctx.newPage()
const shot = process.env.SHOTS
try {
  // 1. Register on A (session hook logs us in immediately)
  await a.goto(A + '#/register')
  await a.getByLabel('E-Mail').fill(email)
  await a.getByLabel('Name').fill('Tester')
  await a.getByRole('button', { name: 'Sign up' }).click() // step 1: traits
  await a.getByLabel('Password').fill(password)              // step 2: password
  await a.getByRole('button', { name: 'Sign up' }).click()
  await a.getByTestId('identity').waitFor()
  assert((await a.getByTestId('identity').innerText()).includes(email), 'register → profile shows the new identity email')
  if (shot) await a.screenshot({ path: shot + '/a-profile.png' })

  // 2. Shared session: B (other origin, same cookie jar) sees the same identity
  await b.goto(B)
  await b.getByTestId('identity').waitFor()
  assert((await b.getByTestId('identity').innerText()).includes(email), 'app B sees the same session without logging in (SSO)')
  if (shot) await b.screenshot({ path: shot + '/b-profile.png' })

  // 3. Logout from A, whoami must be 401
  await a.getByRole('button', { name: 'Logout' }).click()
  await a.getByTestId('logout-result').waitFor()
  assert((await a.getByTestId('logout-result').innerText()).includes('→ 401'), 'logout → whoami returns 401')
  if (shot) await a.screenshot({ path: shot + '/a-logout.png' })

  // 4. B is logged out too
  await b.reload()
  await b.getByTestId('anonymous').waitFor()
  assert(true, 'app B is logged out as well (global session)')

  // 5. Wrong password is rejected with a visible message
  await a.goto(A + '#/login')
  await a.reload()
  await a.getByLabel('E-Mail').fill(email)
  await a.getByLabel('Password').fill('totally-wrong-password')
  await a.getByRole('button', { name: 'Sign in' }).click()
  await a.locator('.msg.error').first().waitFor()
  assert(true, 'wrong password → error message shown: ' + (await a.locator('.msg.error').first().innerText()))

  // 6. Correct login on B (login-only app)
  await b.goto(B + '#/login'); await b.reload()
  await b.getByLabel('E-Mail').fill(email)
  await b.getByLabel('Password').fill(password)
  await b.getByRole('button', { name: 'Sign in' }).click()
  await b.getByTestId('identity').waitFor()
  assert((await b.getByTestId('identity').innerText()).includes(email), 'login on app B → identity details shown')
  await a.goto(A + '#/profile'); await a.reload()
  await a.getByTestId('identity').waitFor()
  assert(true, 'app A sees the session created via app B')
  console.log('\nALL PASSED')
} catch (e) {
  console.error(e.message)
  process.exitCode = 1
} finally {
  await browser.close()
}
