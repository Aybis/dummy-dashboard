import { useEffect, useState } from 'react'
import { APP } from './config.ts'
import { fetchUsers, type AppUser } from './api.ts'

export function Users() {
  const [users, setUsers] = useState<AppUser[]>()
  const [error, setError] = useState<string>()
  useEffect(() => {
    fetchUsers().then(setUsers).catch((e: Error) => setError(e.message))
  }, [])

  return (
    <section className="card wide">
      <h1>User terdaftar di {APP.name}</h1>
      <p className="sub">Dari database {APP.name} sendiri. Hanya admin yang melihat halaman ini.</p>
      {error && <p className="msg error">{error}</p>}
      {!users && !error && <p className="sub">Memuat…</p>}
      {users && (
        <table className="users" data-testid="users">
          <thead>
            <tr><th>Nama</th><th>Email</th><th>Peran</th><th>Login terakhir</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.lastLoginAt ? new Date(u.lastLoginAt + 'Z').toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
