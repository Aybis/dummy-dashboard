import { useState } from 'react'
import type { FormEvent } from 'react'
import type { LoginFlow, RegistrationFlow, UiNode, UiText } from '@ory/client'

type Flow = LoginFlow | RegistrationFlow

/** "traits.email" -> { traits: { email } } — Kratos JSON bodies want nested traits. */
function setDeep(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.')
  let cur = target
  keys.slice(0, -1).forEach((k) => {
    cur = (cur[k] ??= {}) as Record<string, unknown>
  })
  cur[keys[keys.length - 1]] = value
}

function inputOf(node: UiNode) {
  return node.attributes.node_type === 'input' ? node.attributes : null
}

function initialValues(flow: Flow): Record<string, string> {
  const v: Record<string, string> = {}
  for (const node of flow.ui.nodes) {
    const a = inputOf(node)
    if (a && a.type !== 'submit' && a.type !== 'button' && a.value != null) {
      v[a.name] = String(a.value)
    }
  }
  return v
}

function Messages({ messages }: { messages?: UiText[] }) {
  if (!messages?.length) return null
  return (
    <>
      {messages.map((m) => (
        <p key={m.id} className={m.type === 'error' ? 'msg error' : 'msg'}>
          {m.text}
        </p>
      ))}
    </>
  )
}

/**
 * Renders a Kratos flow generically from flow.ui.nodes, so the same component
 * serves login and registration (and would survive schema changes).
 */
export function FlowForm({
  flow,
  submitLabel,
  onSubmit,
}: {
  flow: Flow
  submitLabel: string
  onSubmit: (body: Record<string, unknown>) => Promise<void>
}) {
  const [values, setValues] = useState(() => initialValues(flow))
  const [busy, setBusy] = useState(false)

  // The server re-renders the flow after a failed submit; keep what was typed
  // (except the password) but pick up fresh hidden values such as csrf_token.
  const [lastFlow, setLastFlow] = useState(flow)
  if (lastFlow !== flow) {
    setLastFlow(flow)
    setValues((prev) => {
      const fresh = initialValues(flow)
      const next = { ...fresh }
      for (const k of Object.keys(prev)) if (!(k in fresh) && k !== 'password') next[k] = prev[k]
      return next
    })
  }

  async function handle(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    // Kratos tells us which step this is via the clicked submit node
    // (e.g. method=profile, then method=password on two-step registration).
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const body: Record<string, unknown> = {}
    if (submitter?.name) body[submitter.name] = submitter.value
    for (const [k, v] of Object.entries(values)) setDeep(body, k, v)
    try {
      await onSubmit(body)
    } finally {
      setBusy(false)
    }
  }

  const SHOWN = ['default', 'password', 'profile']
  const nodes = flow.ui.nodes.filter((n) => SHOWN.includes(n.group))
  const submits = nodes.filter((n) => inputOf(n)?.type === 'submit')

  return (
    <form onSubmit={handle} noValidate>
      <Messages messages={flow.ui.messages} />
      {nodes.map((node) => {
        const a = inputOf(node)
        if (!a || a.type === 'hidden' || a.type === 'submit' || a.type === 'button') return null
        const label = node.meta.label?.text ?? a.name
        return (
          <label key={a.name} className="field">
            <span>{label}</span>
            <input
              name={a.name}
              type={a.type}
              required={a.required}
              disabled={a.disabled || busy}
              autoComplete={a.autocomplete}
              value={values[a.name] ?? ''}
              onChange={(e) => setValues((p) => ({ ...p, [a.name]: e.target.value }))}
            />
            <Messages messages={node.messages} />
          </label>
        )
      })}
      {submits.length === 0 && (
        <button type="submit" disabled={busy}>
          {busy ? 'Memproses…' : submitLabel}
        </button>
      )}
      {submits.map((node) => {
        const a = inputOf(node)!
        return (
          <button key={a.name + a.value} type="submit" name={a.name} value={String(a.value ?? '')} disabled={busy}>
            {busy ? 'Memproses…' : (node.meta.label?.text ?? submitLabel)}
          </button>
        )
      })}
    </form>
  )
}
