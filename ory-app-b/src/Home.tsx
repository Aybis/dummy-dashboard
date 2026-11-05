import { useEffect, useState } from 'react'
import { APP } from './config.ts'
import { asList } from './useSession.ts'
import type { Claims } from './oidc.ts'
import type { AppUser } from './api.ts'

function useCountdown(expiresAt: number) {
  const [left, setLeft] = useState(() => Math.max(0, Math.round((expiresAt - Date.now()) / 1000)))
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, Math.round((expiresAt - Date.now()) / 1000))), 1000)
    return () => clearInterval(t)
  }, [expiresAt])
  return `${Math.floor(left / 60)}m ${String(left % 60).padStart(2, '0')}s`
}

const hour = new Date().getHours()
const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam'

export function Home({ claims, expiresAt, user, go }: { claims: Claims; expiresAt: number; user: AppUser; go: (to: string) => void }) {
  const remaining = useCountdown(expiresAt)
  const first = user.name.split(' ')[0]
  const department = asList(claims.groups)[0]
  const title = asList(claims.roles)[0]
  const domain = claims.email?.split('@')[1]
  const internal = domain === 'maya.co.id'

  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">{APP.name}</p>
        <h1>{greeting}, {first}!</h1>
        <p className="sub">Anda login lewat Thermis dan terdaftar di {APP.name} sebagai {user.role}.</p>
      </section>

      <div className="grid">
        <article className="tile">
          <h2>Akun</h2>
          <p className="big">{claims.email}</p>
          <p className="sub">{internal ? 'Akun internal (Maya)' : 'Akun eksternal'}{domain ? ` · ${domain}` : ''}</p>
        </article>
        <article className="tile">
          <h2>Peran di {APP.name}</h2>
          <p className="big">{user.role}</p>
          <p className="sub">{[title, department].filter(Boolean).join(' · ') || 'Tanpa jabatan'}</p>
        </article>
        <article className="tile">
          <h2>Sesi</h2>
          <p className="big">{remaining}</p>
          <p className="sub">sampai token kedaluwarsa</p>
        </article>
      </div>

      <section className="panel">
        <h2>Pintasan</h2>
        <div className="row">
          <button onClick={() => go('/profile')}>Lihat profil &amp; token</button>
          <a className="btn-outline" href={APP.otherApp.url} target="_blank" rel="noreferrer">
            Buka {APP.otherApp.name} (cek SSO) ↗
          </a>
        </div>
        <p className="msg">Buka {APP.otherApp.name}: karena sesi login Thermis dipakai bersama, {APP.otherApp.name} seharusnya langsung masuk tanpa meminta e-mail lagi.</p>
      </section>
    </div>
  )
}
