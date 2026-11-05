# Thermis test clients — App A & App B

Dua SPA React + Vite untuk menguji SSO **Thermis** (Ory Hydra, pengganti Duende).
Login memakai OpenID Connect **Authorization Code + PKCE**, tanpa library: lihat [`src/oidc.ts`](src/oidc.ts).

| Folder | Port | Isi |
|---|---|---|
| `ory-app-a/` | 5174 | Login → detail user (claims ID token + `/userinfo`) → logout |
| `ory-app-b/` | 5175 | Sama; dipakai untuk membuktikan SSO (login tanpa form kedua kalinya) |

Panduan lengkap (Thermis, Azure AD / B2C, registrasi aplikasi, skenario uji):
**`SETUP-LOCAL.md` di repo `Aybis/ory`**.

## Ringkas

1. Daftarkan app di portal Thermis sebagai **Single-page application**:
   redirect URI `http://localhost:5174/callback`, post-logout URI `http://localhost:5174/`,
   CORS origin `http://localhost:5174`, scope `openid profile email`.
   SPA adalah *public client*: **tidak ada client secret** — PKCE yang melindungi penukaran code.
2. `cp .env.example .env.local`, isi `VITE_OIDC_CLIENT_ID` dengan client_id dari portal.
3. `npm install && npm run dev` → http://localhost:5174

Ulangi untuk `ory-app-b` (port 5175). Origin kedua app juga harus ada di
`serve.public.cors.allowed_origins` Hydra (sudah diisi di `infra/hydra/hydra.yml` Thermis untuk 5174/5175).

## Env (`.env.local`, semua nilai publik)

| Variabel | Contoh | Keterangan |
|---|---|---|
| `VITE_OIDC_ISSUER` | `http://localhost:4444` | URL publik Hydra (issuer) |
| `VITE_OIDC_CLIENT_ID` | `c5e9e029-…` | client_id dari portal Thermis — **wajib** |
| `VITE_OIDC_SCOPE` | `openid profile email` | harus diizinkan untuk aplikasi di Thermis |
| `VITE_APP_URL` | `http://localhost:5174` | origin app; redirect URI = `{VITE_APP_URL}/callback` |
| `VITE_OIDC_REDIRECT_URI` | *(opsional)* | override redirect URI |
| `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` | *(opsional)* | override post-logout URI |
| `VITE_OTHER_APP_URL` | `http://localhost:5175/` | link "Buka App B" untuk tes SSO |

## Catatan

- Token disimpan di `sessionStorage` (per tab) — cukup untuk app uji. Untuk produksi, pertimbangkan
  pola *backend-for-frontend* agar token tidak pernah sampai ke JavaScript.
- **Logout (SSO)** mengakhiri sesi Thermis (RP-initiated logout). Token yang sudah ada di app lain
  tetap berlaku sampai kedaluwarsa, karena app uji ini belum mengimplementasikan front/back-channel logout.
