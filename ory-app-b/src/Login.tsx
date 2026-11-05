import { useState } from 'react'
import { OIDC } from './config.ts'
import { login } from './oidc.ts'

export function Login({ error }: { error?: string }) {
  const [localError, setLocalError] = useState<string>()
  const shown = localError ?? error

  return (
    <section className="card">
      <h1>{error ? 'Login gagal' : 'Belum login'}</h1>
      <p className="sub">Login akan diarahkan ke Thermis ({OIDC.issuer}). Masukkan e-mail, Thermis menentukan penyedia login yang sesuai.</p>
      {shown && <p className="msg error">{shown}</p>}
      <button onClick={() => { setLocalError(undefined); login().catch((e: Error) => setLocalError(e.message)) }}>
        {error ? 'Coba login lagi' : 'Login'}
      </button>
    </section>
  )
}
