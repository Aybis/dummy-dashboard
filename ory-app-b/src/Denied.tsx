import { APP } from './config.ts'
import { logout } from './oidc.ts'
import type { Claims } from './oidc.ts'

export function Denied({ claims, reason }: { claims: Claims; reason: 'not_registered' | 'disabled' }) {
  return (
    <section className="card">
      <h1>Akses ditolak</h1>
      <p className="msg error" data-testid="denied">
        {reason === 'disabled'
          ? `Akun ${APP.name} Anda dinonaktifkan.`
          : `${claims.email} belum terdaftar di ${APP.name}.`}
      </p>
      <p className="sub">
        Login Anda lewat Thermis berhasil dan identitas Anda valid, tetapi {APP.name} hanya mengizinkan user yang terdaftar di database aplikasinya. Hubungi admin {APP.name} untuk didaftarkan.
      </p>
      <div className="row">
        <button onClick={() => void logout()}>Logout</button>
        <a className="btn-link" href={APP.otherApp.url} target="_blank" rel="noreferrer">Coba {APP.otherApp.name} ↗</a>
      </div>
    </section>
  )
}
