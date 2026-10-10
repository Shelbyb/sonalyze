<p align="center">
  <img src="public/brand/logo-192.png" alt="Sonalyze Logo" width="128" height="128" />
</p>

# Sonalyze — Audio Intelligence & Spotify Listening Visualizer


<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js >=22" />
  <img src="https://img.shields.io/badge/npm-%3E%3D10.0.0-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm >=10" />
  <img src="https://img.shields.io/badge/Next.js-16.4.0-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Test_Coverage-88%25-1ed760?style=for-the-badge&logo=vitest&logoColor=black" alt="88% Coverage" />
  <img src="https://img.shields.io/badge/E2E_Tests-Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright E2E" />
  <img src="https://img.shields.io/badge/Security-Hardened-orange?style=for-the-badge&logo=shield" alt="Security Hardened" />
  <img src="https://img.shields.io/badge/DigitalOcean-App_Platform-0080FF?style=for-the-badge&logo=digitalocean&logoColor=white" alt="DigitalOcean" />
  <img src="https://img.shields.io/badge/Demo-sonalyze.daywalker.dev-purple?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
</p>

> 🚀 **Live Working Demo**: [https://sonalyze.daywalker.dev](https://sonalyze.daywalker.dev)

**Sonalyze** is a high-performance web application that transforms Spotify listening data into interactive visual profiles: 30-second streaming audio previews, real-time client-side search and filtering, audio DNA radar charts, sonic archetype analysis, CSV data exports, and smart playlist generation with direct Spotify synchronization.

No central database is required. Sessions are stored securely in browser-encrypted JWT cookies via NextAuth.

---

## 📚 Table of Contents / Glossary

- [Tech Stack Carousel](#-tech-stack-carousel)
- [Key Features & Performance Optimizations](#-key-features--performance-optimizations)
- [Live Production Demo & Domain](#-live-production-demo--domain)
- [1. Spotify Developer Setup](#-1-spotify-developer-setup)
- [2. Daywalker Account & API Key](#-2-daywalker-account--api-key)
- [3. Configure Environment Variables](#-3-configure-environment-variables)
- [4. Daywalker Service Authorization](#-4-daywalker-service-authorization)
- [5. Local Development](#-5-local-development)
- [6. Testing & Quality Assurance](#-6-testing--quality-assurance)
- [7. DigitalOcean App Platform Deployment](#-7-digitalocean-app-platform-deployment)
- [8. Security & Hardening Safeguards](#-8-security--hardening-safeguards)
- [9. Troubleshooting](#-9-troubleshooting)

---

## 🎛️ Tech Stack Carousel

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SONALYZE TECH STACK                                    │
├───────────────┬─────────────────┬────────────────┬───────────────────┬─────────────────┤
│   Framework   │     Styling     │ Authentication │   Visualization   │     Testing     │
├───────────────┼─────────────────┼────────────────┼───────────────────┼─────────────────┤
│  Next.js 16   │ Tailwind CSS v4 │ NextAuth.js +  │     Recharts      │  Vitest (88%+)  │
│  (Turbopack)  │    + PostCSS    │ Daywalker Auth │  (Radar / Bar)    │ Playwright E2E  │
└───────────────┴─────────────────┴────────────────┴───────────────────┴─────────────────┘
```

| Technology | Purpose & Implementation |
| :--- | :--- |
| **Next.js 16** | App Router, Turbopack compilation, standalone container output, and route streaming. |
| **Tailwind CSS v4** | Modern CSS theme engine with GPU-accelerated micro-animations and responsive grid. |
| **Daywalker Auth** | Cryptographic service authorization, RFC 9421 HTTP Message Signatures, and perimeter middleware. |
| **NextAuth.js** | Stateless Spotify OAuth 2.0 provider with automatic token refreshing and HTTP-only JWTs. |
| **Recharts** | Interactive vector radar charts and bar charts for audio DNA and genre distribution. |
| **Lucide React** | Streamlined SVG icon system for UI controls and music indicators. |
| **Vitest & Playwright**| 88%+ line test coverage across all components and API utilities, plus cross-browser E2E testing. |
| **Docker & DigitalOcean**| Multi-stage Alpine container running as unprivileged `nextjs:nodejs` user. |

---

## 🚀 Key Features & Performance Optimizations

- **Global 30s Audio Preview Player**: Listen to 30-second audio previews inline across Top Tracks, Recently Played, Dashboard, and Track Details with animated equalizer bars, scrub bar, volume control, and keyboard shortcuts (`Space` to toggle playback).
- **Sub-Millisecond Client-Side Caching**: In-memory caching and in-flight request deduplication with exponential backoff on Spotify rate limits.
- **Instant Search & Sort**: Real-time filtering and multi-attribute sorting across all track and artist catalogs.
- **CSV Spreadsheet Export**: One-click download of Top Tracks and Listening History.
- **One-Click Playlist Creation**: Export your ranked listening data straight into a new Spotify playlist in your personal library.
- **Audio DNA Breakdown**: Radar analysis of Danceability, Energy, Valence, Acousticness, Instrumentalness, Liveness, Speechiness, Camelot key notation, Tempo, and Loudness.
- **Taste Profile & Archetypes**: Algorithmically derives your Sonic Archetype (e.g. *High-Octane Party Catalyst*, *Radiant Mood Uplifter*) with shareable summary cards.

---

## 🌐 Live Production Demo

- **Live Production URL**: [https://sonalyze.daywalker.dev](https://sonalyze.daywalker.dev)
- **Subdomain**: `sonalyze.daywalker.dev`
- **Container Health Check Endpoints**:
  - `/api/health` — JSON status payload with service authorization, uptime, timestamp, and HTTP 200 response
  - `/healthz` — Lightweight liveness/readiness probe compliant with DigitalOcean and Kubernetes standards

---

## 🛠️ 1. Spotify Developer Setup

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **Create app**.
3. In **Redirect URIs**, add:
   - **Local development**: `https://localhost:3000/api/auth/callback/spotify`
   - **Production**: `https://<your_domain>/api/auth/callback/spotify` (and `https://<your_app_name>.ondigitalocean.app/api/auth/callback/spotify`)
4. Save and copy your **Client ID** and **Client Secret**.

---

## 🛡️ 2. Daywalker Account & API Key

1. Create a free account at [Daywalker Dev](https://auth.daywalker.dev/signup?service=sonalyze).
2. Generate an **API Key** (`DAYWALKER_API_KEY`) from the dashboard for Sonalyze service authorization.
3. Keep this key secure for your local and production environments.

---

## 🔑 3. Configure Environment Variables

Copy [`.env.local.example`](./.env.local.example) to `.env.local` for local development. In production, variables are set on the DigitalOcean app dashboard:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set your Spotify Developer API credentials and auth secrets:

```bash
# Spotify Developer API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Authentication Secret (generate in terminal with `openssl rand -base64 48`)
NEXTAUTH_SECRET=your-secure-random-nextauth-secret-min-32-chars
NEXTAUTH_URL=https://localhost:3000

# Daywalker Service Authorization (Free: https://auth.daywalker.dev/signup?service=sonalyze)
DAYWALKER_API_KEY=your_daywalker_api_key
APP_URL=https://<your_domain_url>
```

### Environment Variables Reference

| Variable | Required | Scope | Details |
|---|---|---|---|
| `SPOTIFY_CLIENT_ID` | ✅ Yes | `RUN_AND_BUILD_TIME` | 🔒 **Secret.** Spotify Developer Application Client ID. |
| `SPOTIFY_CLIENT_SECRET` | ✅ Yes | `RUN_AND_BUILD_TIME` | 🔒 **Secret.** Spotify Developer Application Client Secret. |
| `NEXTAUTH_SECRET` | ✅ Yes | `RUN_AND_BUILD_TIME` | 🔒 **Secret.** Cryptographic secret used to sign and encrypt JWT cookies (`openssl rand -base64 48`). Rotating it invalidates existing sessions. |
| `NEXTAUTH_URL` | ✅ Yes | `RUN_AND_BUILD_TIME` | Canonical authentication URL (`https://localhost:3000` locally, `${APP_URL}` in production). |
| `DAYWALKER_API_KEY` | ✅ Yes | `RUN_AND_BUILD_TIME` | 🔒 **Secret.** Daywalker service API token (`srv_live_...`, or `enc:v1:` encrypted). |
| `DAYWALKER_SIGNING_KEY` | ⚠️ Recommended | `RUN_TIME` | 🔒 **Secret.** Ed25519 PKCS#8 key used to sign outbound validate requests with RFC 9421 / RFC 9530 HTTP Message Signatures. |
| `DAYWALKER_KEY_ID` | ➖ Optional | `RUN_TIME` | RFC 7638 JWK thumbprint or key identifier registered in Daywalker Auth. |
| `DAYWALKER_SIGNING_DOMAIN` | ➖ Optional | `RUN_TIME` | Public hostname the signature is issued for (`sonalyze.daywalker.dev`). Takes precedence over `APP_URL`. |
| `DAYWALKER_PUBLIC_KEY` | ➖ Optional | `RUN_TIME` | Optional Daywalker public key / JWK for zero-egress offline JWT token lease verification. |
| `APP_URL` | ➖ Optional | `RUN_TIME` | Public origin (`https://sonalyze.daywalker.dev`). Used for the signing domain when `DAYWALKER_SIGNING_DOMAIN` is unset. |
| `NODE_ENV` | ➖ Optional | `RUN_AND_BUILD_TIME` | Application environment mode (`production` / `development`). |

**Legend**

- **Required:** ✅ the app won't start or work correctly without it · ⚠️ works without it, but a feature is degraded or disabled · ➖ has a sensible default.
- **Scope** ([App Platform docs](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)):
  - `RUN_TIME` — available only while the app is running. Use for server-only values and secrets.
  - `BUILD_TIME` — available only during `next build`.
  - `RUN_AND_BUILD_TIME` — available in both. **Required for every `NEXT_PUBLIC_*` variable**, because Next.js inlines them into the client bundle at build time. Each must also be declared as an `ARG` in the `Dockerfile` builder stage.
- 🔒 **Secret** — set with `type: SECRET` in the app spec. App Platform encrypts it, and the value is never shown again.

> [!WARNING]
> Never prefix a secret with `NEXT_PUBLIC_` — anything with that prefix is shipped to the browser.

---

## 🛡️ 4. Daywalker Service Authorization

Sonalyze enforces cryptographic service authorization directly across its runtime perimeter:

1. **Perimeter Middleware (`middleware.ts`)**:
   - Blocks automated scanning attacks probing for Next.js Server Action vulnerabilities (CVE-2025-55182).
   - Validates service authorization for incoming requests and seamlessly routes unauthorized web users to a diagnostic `/service-error` screen with self-healing recovery.
   - Responds with structured RFC 7807/JSON 401/429 errors for API endpoints.
   - Bypasses static assets and probe endpoints (`/api/health`, `/healthz`, `/favicon.ico`, `/robots.txt`).

2. **Cryptographic Request Signing (RFC 9421 / RFC 9530)**:
   - Outbound validation requests from Sonalyze to `auth.daywalker.dev` are signed using Ed25519 keys via WebCrypto.
   - Uses standard `Signature-Input`, `Signature`, and `Content-Digest` headers to prove hostname identity without DNS reverse-lookup bottlenecks.

3. **Multi-Layer Service Guard**:
   - `requireServiceAuth()` guards Spotify API fetches, session resolution, and NextAuth callbacks.
   - Automatic token caching (60s TTL) with exponential backoff and jitter on rate limits.

---

## 💻 5. Local Development

### System Requirements
- **Node.js**: `>=22.0.0` (Active LTS / v24 recommended, managed via `.nvmrc` / `.node-version`)
- **npm**: `>=10.0.0` (enforced via `engine-strict` in `.npmrc` and `packageManager` specification)

Install dependencies and start the secure development server:

```bash
# Switch to supported Node version (optional if using nvm/fnm)
nvm use

# Install dependencies with strict engine validation
npm install

# Start development server with TLS
npm run dev:secure
```

Open [https://localhost:3000](https://localhost:3000) in your browser.

---

## 🧪 6. Testing & Quality Assurance

### Run Full Quality & Type Validation:
```bash
npm run validate
```

### Run Unit Tests & Coverage (88% Covered):
```bash
npm run test:coverage
```

### Run Playwright E2E Tests:
```bash
npm run test:e2e
```

---

## ☁️ 7. DigitalOcean App Platform Deployment

The repository is configured with a hardened, multi-stage `Dockerfile` (`output: "standalone"`).

### Deploy via Control Panel or doctl CLI
1. Push this repository to your GitHub repo (`<username>/<repository_name>`).
2. DigitalOcean App Platform automatically builds the multi-stage Docker image and executes health checks against `/api/health` before routing live traffic.
3. Under **Environment Variables**, configure:
   - `SPOTIFY_CLIENT_ID`: Your client ID (Encrypted Secret)
   - `SPOTIFY_CLIENT_SECRET`: Your client secret (Encrypted Secret)
   - `NEXTAUTH_SECRET`: Random 48-byte cryptographic secret (Encrypted Secret, generate with `openssl rand -base64 48`)
   - `NEXTAUTH_URL`: `${APP_URL}`
   - `DAYWALKER_API_KEY`: Daywalker service token (Encrypted Secret)
   - `DAYWALKER_SIGNING_KEY`: Ed25519 signing key (Encrypted Secret)
   - `DAYWALKER_SIGNING_DOMAIN`: `sonalyze.daywalker.dev`
   - `NODE_ENV`: `production`
4. Register the live callback URL (`https://<your_domain>/api/auth/callback/spotify`) with the Spotify Developer Dashboard.

---

## 🔒 8. Security & Hardening Safeguards

- **Stateless Cookies**: Zero server-side session persistence.
- **Strict Content Security & Headers**:
  - `Strict-Transport-Security` (max-age=63072000; preload)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (disables camera, microphone, geolocation)
- **Zero Production Vulnerabilities**: `npm audit --omit=dev` verified with 0 vulnerabilities.
- **Unprivileged Container**: Runs on Alpine Linux as non-root `nextjs:nodejs` user.

---

## 🩺 9. Troubleshooting

### "No active key '<key id>' is registered for this service"

**Problem**

Loading the site redirected to `/service-error` with the message `No active key '<key id>' is registered for this service`. The app was signing its authorization requests with a key pair (`DAYWALKER_KEY_ID` + `DAYWALKER_SIGNING_KEY`) whose public half was not registered, or was no longer active, with Daywalker Auth for the `sonalyze` service. This can happen when a key was generated locally but never registered, or when it was replaced or revoked by a later registration.

**Fix**

1. Make sure `DAYWALKER_API_KEY` is set in `.env.local`. Registration needs it, and without it the key cannot be registered.
2. Run the registration command from the project root:
   ```bash
   npx daywalker init --domain sonalyze.daywalker.dev --service sonalyze
   ```
   It reuses the key pair already in `.env.local` and registers its public key with Daywalker Auth.
3. Confirm that `DAYWALKER_KEY_ID` and `DAYWALKER_SIGNING_KEY` in the deployed environment come from the same key pair as `.env.local`. If they differ, copy both values from one run into the DigitalOcean app as secrets and redeploy.
4. Reload the site. It should load normally with no redirect to `/service-error`.

> [!NOTE]
> Always set `DAYWALKER_KEY_ID` and `DAYWALKER_SIGNING_KEY` together from the same run. Running `init` with a new key replaces the previously active key.
