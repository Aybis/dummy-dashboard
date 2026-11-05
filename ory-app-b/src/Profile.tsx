import { asList } from './useSession.ts'
import { getTokens, type Claims } from './oidc.ts'
import type { AppUser } from './api.ts'

function Row({ k, v }: { k: string; v: string | undefined }) {
  return (
    <tr>
      <th>{k}</th>
      <td>{v || '—'}</td>
    </tr>
  )
}

const when = (seconds: unknown) => (typeof seconds === 'number' ? new Date(seconds * 1000).toLocaleString() : undefined)

export function Profile({ claims, expiresAt, user }: { claims: Claims; expiresAt: number; user: AppUser }) {
  const tokens = getTokens()
  return (
    <section className="card wide">
      <h1>Profil</h1>
      <p className="sub">Diambil dari id_token yang dikeluarkan Thermis.</p>
      <table data-testid="identity">
        <tbody>
          <Row k="Nama" v={claims.name as string | undefined} />
          <Row k="Email" v={claims.email} />
          <Row k="Username" v={claims.preferred_username as string | undefined} />
          <Row k="Departemen" v={asList(claims.groups).join(', ')} />
          <Row k="Jabatan" v={asList(claims.roles).join(', ')} />
          <Row k="Peran di aplikasi" v={user.role} />
          <Row k="Terdaftar sejak" v={new Date(user.registeredAt + 'Z').toLocaleString()} />
          <Row k="Subject (sub)" v={claims.sub} />
          <Row k="Login pada" v={when(claims.iat)} />
          <Row k="Token berakhir" v={new Date(expiresAt).toLocaleString()} />
        </tbody>
      </table>
      <details>
        <summary>Raw id_token claims</summary>
        <pre>{JSON.stringify(claims, null, 2)}</pre>
      </details>
      {tokens && (
        <details>
          <summary>Access token (opaque, dikirim ke API)</summary>
          <pre>{tokens.access_token.slice(0, 24)}…</pre>
        </details>
      )}
    </section>
  )
}
