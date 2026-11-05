# Ory SSO test — Kratos + 2 React apps

| Folder | Port | Peran |
|---|---|---|
| `ory-kratos/` | 4433 (public) / 4434 (admin) | Konfigurasi Ory Kratos (docker-compose) — opsional, kalau tidak memakai Ory Anda sendiri |
| `ory-app-a/` | 5174 | Register · Login · detail user (`whoami`) · Logout |
| `ory-app-b/` | 5175 | Login · detail user · Logout — membuktikan session dipakai bersama (SSO) |

Kedua app adalah SPA React + Vite biasa. Semua alamat Ory ada di env (`.env.example` di tiap folder).

## Pakai Ory milik Anda sendiri
1. Di tiap app: `cp .env.example .env.local`, isi `VITE_KRATOS_URL` dengan URL public Kratos / SDK URL Ory Network Anda.
2. Di konfigurasi Ory Anda, daftarkan **kedua** origin app (`http://localhost:5174`, `http://localhost:5175`):
   - `selfservice.allowed_return_urls`
   - `serve.public.cors.allowed_origins` (+ `allow_credentials: true`)
3. **Cookie harus same-site dengan app.** Browser flow memakai cookie session, jadi Ory harus berada di site yang sama dengan app. Untuk Ory Network saat development: `ory tunnel --project <id> http://localhost:5174` lalu isi `VITE_KRATOS_URL` dengan URL tunnel (`http://localhost:4000`). Di produksi: pakai custom domain pada subdomain yang sama dengan app.
4. Form dirender dari `flow.ui.nodes`, dan tombol submit mengikuti node dari server, jadi registrasi satu/dua langkah dan label dari Ory Anda otomatis terbawa.

> Jika yang Anda maksud SSO via **OAuth2/OIDC (Ory Hydra / Ory Network OAuth2)**, bukan browser flow Kratos, alur login di app ini perlu diganti dengan Authorization Code + PKCE. Beri tahu saya.

## Jalankan Kratos lokal (opsional)
```bash
cd ory-kratos
cp .env.example .env     # isi KRATOS_COOKIE_SECRET dan KRATOS_CIPHER_SECRET (32 karakter)
docker compose up
```

## Jalankan app
```bash
cd ory-app-a && npm install && npm run dev     # http://localhost:5174
cd ory-app-b && npm install && npm run dev     # http://localhost:5175
```
Pakai `localhost`, bukan `127.0.0.1`, supaya cookie dan CORS cocok.

## Skenario uji manual
1. App A → Daftar → langsung masuk ke halaman **Detail login user** (identity id, email, session, expiry, metode login).
2. Buka App B → sudah login tanpa login ulang (SSO).
3. Logout di App A → halaman menampilkan `GET /sessions/whoami → 401`. App B juga logout.
4. Login kembali dari App B → App A ikut melihat session.

## Tes otomatis
Dengan Kratos + kedua app berjalan: `NODE_PATH=$(npm root -g) node e2e.mjs` (butuh `playwright`).
