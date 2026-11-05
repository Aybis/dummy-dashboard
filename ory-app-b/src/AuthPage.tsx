import { useEffect, useState } from 'react'
import type { LoginFlow, RegistrationFlow } from '@ory/client'
import { APP } from './config.ts'
import { FlowForm } from './FlowForm.tsx'
import { errorText, httpData, httpStatus, ory } from './ory.ts'

type Mode = 'login' | 'register'
type Flow = LoginFlow | RegistrationFlow

function createFlow(mode: Mode) {
  const returnTo = APP.origin + '/'
  return mode === 'login'
    ? ory.createBrowserLoginFlow({ returnTo })
    : ory.createBrowserRegistrationFlow({ returnTo })
}

/** One page for both flows — they only differ in the API call and the copy. */
export function AuthPage({ mode, go }: { mode: Mode; go: (to: string) => void }) {
  const [flow, setFlow] = useState<Flow | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setFlow(null)
    setError(null)
    createFlow(mode)
      .then(({ data }) => !cancelled && setFlow(data))
      .catch((err) => {
        if (cancelled) return
        // Already signed in (e.g. via the other app) -> nothing to do here.
        const id = httpData<{ error?: { id?: string } }>(err)?.error?.id
        if (id === 'session_already_available') go('/profile')
        else setError(errorText(err))
      })
    return () => {
      cancelled = true
    }
  }, [mode, go])

  async function submit(body: Record<string, unknown>) {
    if (!flow) return
    try {
      if (mode === 'login') {
        await ory.updateLoginFlow({ flow: flow.id, updateLoginFlowBody: body as never })
      } else {
        await ory.updateRegistrationFlow({
          flow: flow.id,
          updateRegistrationFlowBody: body as never,
        })
      }
      go('/profile')
    } catch (err) {
      const status = httpStatus(err)
      if (status === 400) setFlow(httpData<Flow>(err) ?? flow) // validation errors live in ui.messages
      else if (status === 410) go(mode === 'login' ? '/login?r=' + Date.now() : '/register?r=' + Date.now())
      else setError(errorText(err))
    }
  }

  const isLogin = mode === 'login'
  return (
    <section className="card">
      <h1>{isLogin ? 'Login' : 'Daftar'}</h1>
      <p className="sub">
        {isLogin ? `Masuk ke ${APP.name} dengan akun Ory Kratos.` : `Buat identity baru di Ory Kratos.`}
      </p>
      {error && <p className="msg error">{error}</p>}
      {!flow && !error && <p className="sub">Membuat flow…</p>}
      {flow && (
        <FlowForm
          key={flow.id + flow.ui.nodes.length}
          flow={flow}
          submitLabel={isLogin ? 'Login' : 'Daftar'}
          onSubmit={submit}
        />
      )}
      <p className="alt">
        {isLogin ? (
          APP.registerEnabled ? (
            <>
              Belum punya akun? <a href="#/register">Daftar</a>
            </>
          ) : (
            <>
              Belum punya akun? Buat di <a href={APP.otherApp.url + '#/register'}>{APP.otherApp.name}</a>
            </>
          )
        ) : (
          <>
            Sudah punya akun? <a href="#/login">Login</a>
          </>
        )}
      </p>
    </section>
  )
}
