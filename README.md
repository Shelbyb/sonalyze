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

No database is required. By default Sonalyze runs in **browser storage mode**, with sessions in browser-encrypted JWT cookies via NextAuth and preferences in `localStorage`. Optionally connect **Postgres** for cross-device preferences, listening history and track tags (see [Storage Modes](#-storage-modes)).

---

## 📚 Table of Contents / Glossary

- [One-Click Deploy](#-one-click-deploy)
- [Tech Stack Carousel](#-tech-stack-carousel)
- [Key Features & Performance Optimizations](#-key-features--performance-optimizations)
- [Spotify Extended Access & Last.fm Hybridization Architecture](#-spotify-extended-access--lastfm-hybridization-architecture)
- [Live Production Demo & Domain](#-live-production-demo--domain)
- [1. Spotify Developer Setup](#-1-spotify-developer-setup)
- [2. Last.fm API Key Setup](#-2-lastfm-api-key-setup-optional)
- [3. Daywalker Account & API Key](#-3-daywalker-account--api-key)
- [4. Configure Environment Variables](#-4-configure-environment-variables)
- [5. Daywalker Service Authorization](#-5-daywalker-service-authorization)
- [Storage Modes](#-storage-modes)
- [6. Local Development & Cloning](#-6-local-development--cloning)
- [7. Testing, Quality Assurance & Linting](#-7-testing-quality-assurance--linting)
- [8. DigitalOcean App Platform Deployment](#-8-digitalocean-app-platform-deployment)
- [9. Security & Hardening Safeguards](#-9-security--hardening-safeguards)
- [10. Troubleshooting](#-10-troubleshooting)
- [Docker & Compose](#-docker--compose)

---

## ⚡ One-Click Deploy

<p align="center">
  <a href="https://cloud.digitalocean.com/apps/new?repo=https://github.com/Shelbyb/sonalyze/tree/main"><img src="https://www.deploytodo.com/do-btn-blue.svg" alt="Deploy to DigitalOcean" /></a>
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShelbyb%2Fsonalyze&amp;project-name=sonalyze&amp;repository-name=sonalyze&amp;env=SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET,NEXTAUTH_SECRET,NEXTAUTH_URL,APP_URL,DAYWALKER_API_KEY,DAYWALKER_SIGNING_KEY,DAYWALKER_KEY_ID&amp;envDescription=Spotify%20app%20credentials%2C%20a%20random%20NextAuth%20secret%2C%20and%20your%20registered%20Daywalker%20key%20pair&amp;envLink=https%3A%2F%2Fgithub.com%2FShelbyb%2Fsonalyze%23-4-configure-environment-variables"><img src="https://vercel.com/button" alt="Deploy with Vercel" /></a>
</p>

Before deploying you need the Spotify credentials (section 1), a Last.fm API key if desired (section 2), a Daywalker API key (section 3), and a registered signing key pair from `DAYWALKER_SIGNING_KEY` + `DAYWALKER_KEY_ID` (section 5). Fill in the secrets when prompted, then add the app's callback URL (`https://<your_app_domain>/api/auth/callback/spotify`) in the Spotify Developer Dashboard.

- **DigitalOcean** uses [`.do/deploy.template.yaml`](./.do/deploy.template.yaml) and the `Dockerfile`. Fork the repo and edit `repo:` in the template to deploy your own copy.
- **Vercel** uses [`vercel.json`](./vercel.json) (`npm ci`, then `npm run build`, which runs the Daywalker integrity check). After the first deploy, add `LASTFM_API_KEY` and `NEXT_PUBLIC_LASTFM_API_KEY` (plain values; the key is shared, not secret) if you want your own Last.fm quota. Set `NEXTAUTH_URL` and `APP_URL` to your production URL, and register the signing key for that domain. Vercel has no container entrypoint, so run `node scripts/migrate.mjs` yourself if you enable Postgres.

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
├───────────────┼─────────────────┼────────────────┴───────────────────┴─────────────────┤
│ Music Data    │ Spotify Web API + Last.fm Music Intelligence API (Hybrid Resolution)   │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```

| Technology                | Purpose & Implementation                                                                         |
| :------------------------ | :----------------------------------------------------------------------------------------------- |
| **Next.js 16**            | App Router, Turbopack compilation, standalone container output, and route streaming.             |
| **Tailwind CSS v4**       | Modern CSS theme engine with GPU-accelerated micro-animations and responsive grid.               |
| **Daywalker Auth**        | Cryptographic service authorization, RFC 9421 HTTP Message Signatures, and perimeter middleware. |
| **NextAuth.js**           | Stateless Spotify OAuth 2.0 provider with automatic token refreshing and HTTP-only JWTs.         |
| **Spotify Web API**       | User listening history, top artists/tracks, profile management, and direct playlist creation.    |
| **Last.fm API**           | Catalog similarity graph, genre discovery, and acoustic intelligence fallback.                   |
| **Recharts**              | Interactive vector radar charts and bar charts for audio DNA and genre distribution.             |
| **Lucide React**          | Streamlined SVG icon system for UI controls and music indicators.                                |
| **Vitest & Playwright**   | 88%+ line test coverage across all components and API utilities, plus cross-browser E2E testing. |
| **Docker & DigitalOcean** | Multi-stage Alpine container running as unprivileged `nextjs:nodejs` user.                       |

---

## 🚀 Key Features & Performance Optimizations

- **Global 30s Audio Preview Player**: Listen to 30-second audio previews inline across Top Tracks, Recently Played, Dashboard, and Track Details with animated equalizer bars, scrub bar, volume control, and keyboard shortcuts (`Space` to toggle playback).
- **Sub-Millisecond Client-Side Caching**: In-memory caching and in-flight request deduplication with exponential backoff on Spotify rate limits.
- **Smart Playlist Generator (Discover)**: Generate intelligent recommendation mixes based on seed playlists and acoustic sliders (Energy, Valence, Danceability), complete with 1-click export to Spotify.
- **Instant Search & Sort**: Real-time filtering and multi-attribute sorting across all track and artist catalogs.
- **CSV Spreadsheet Export**: One-click download of Top Tracks and Listening History.
- **Audio DNA Breakdown**: Radar analysis of Danceability, Energy, Valence, Acousticness, Instrumentalness, Liveness, Speechiness, Camelot key notation, Tempo, and Loudness.
- **Taste Profile & Archetypes**: Algorithmically derives your Sonic Archetype (e.g. _High-Octane Party Catalyst_, _Radiant Mood Uplifter_) with shareable summary cards.

---

## 🧠 Spotify Extended Access & Last.fm Hybridization Architecture

### Why Hybridization is Required

In late 2024 and 2025, Spotify updated its Web API access policy, restricting algorithmic discovery and audio analysis endpoints:

- `GET /v1/recommendations`
- `GET /v1/recommendations/available-genre-seeds`
- `GET /v1/audio-features` and `GET /v1/audio-analysis`

These endpoints return `HTTP 403 Forbidden` for standard developer apps running in **Development Mode** unless the app has been granted **Extended Quota Mode / Extended API Access** (a status Spotify now reserves strictly for registered commercial partner organizations).

### How Sonalyze Solves This Seamlessly

To ensure maximum utility, high availability, and zero feature degradation for any developer cloning or deploying Sonalyze:

1. **Intelligent Fallback Architecture**:
   - When generating recommendations or analyzing acoustic features, Sonalyze attempts the direct Spotify endpoint first.
   - If Spotify responds with HTTP 403, Sonalyze automatically routes the request through the **Last.fm Music Intelligence API** (`track.getSimilar`, `artist.getSimilar`, `tag.getTopTracks`, `track.getTopTags`).
2. **Catalog Resolution & Spotify Normalization**:
   - The candidates returned from Last.fm's similarity graph are immediately resolved against the official Spotify Catalog via `searchTracks` / `getSeveralTracks`.
   - The resulting objects are normalized into full `SpotifyTrack` entities with official album art, 30-second preview audio streams, and Spotify URIs.
3. **Native Spotify Integration**:
   - Generated recommendations can be exported straight into the user's personal Spotify library in 1 click via `createPlaylistWithTracks`.
4. **Zero-Config Default & Dedicated Key Support**:
   - An active fallback API key is built into `lib/lastfm.ts` with 15-minute in-memory caching. You can optionally supply your own `LASTFM_API_KEY` for isolated quotas.

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

## 🎵 2. Last.fm API Key Setup (Optional)

Sonalyze includes a built-in fallback key for the Last.fm music intelligence engine, but creating your own dedicated free API key ensures isolated rate limits and maximum reliability:

1. Create a free account or log in at [Last.fm](https://www.last.fm).
2. Open the [Last.fm API Account Creation Form](https://www.last.fm/api/account/create).
3. Complete the short registration form:
   - **Application name**: `Sonalyze` (or your project name)
   - **Application description**: Audio intelligence and smart playlist recommendation engine.
   - Leave **Callback URL** and **Homepage** blank (or set to your app's domain).
4. Click **Submit**. Your **API Key** is generated immediately (zero review wait times).
5. Copy your **API Key** and set it as `LASTFM_API_KEY` and `NEXT_PUBLIC_LASTFM_API_KEY` in `.env.local` and your production deployment settings.

---

## 🛡️ 3. Daywalker Account & API Key

1. Create a free account at [Daywalker Dev](https://auth.daywalker.dev/signup?service=sonalyze).
2. Generate an **API Key** (`DAYWALKER_API_KEY`) from the dashboard for Sonalyze service authorization.
3. Keep this key secure for your local and production environments.

---

## 🔑 4. Configure Environment Variables

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

| Variable                     | Required       | Scope                | Details                                                                                                                                                      |
| ---------------------------- | -------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SPOTIFY_CLIENT_ID`          | ✅ Yes         | `RUN_TIME`           | 🔒 **Secret.** Spotify Developer Application Client ID.                                                                                                      |
| `SPOTIFY_CLIENT_SECRET`      | ✅ Yes         | `RUN_TIME`           | 🔒 **Secret.** Spotify Developer Application Client Secret.                                                                                                  |
| `NEXTAUTH_SECRET`            | ✅ Yes         | `RUN_TIME`           | 🔒 **Secret.** Cryptographic secret used to sign and encrypt JWT cookies (`openssl rand -base64 48`). Rotating it invalidates existing sessions.             |
| `NEXTAUTH_URL`               | ✅ Yes         | `RUN_AND_BUILD_TIME` | Canonical authentication URL (`https://localhost:3000` locally, `${APP_URL}` in production).                                                                 |
| `DAYWALKER_API_KEY`          | ✅ Yes         | `RUN_TIME`           | 🔒 **Secret.** Daywalker service API token (`srv_live_...`, or `enc:v1:` encrypted).                                                                         |
| `LASTFM_API_KEY`             | ➖ Optional    | `RUN_AND_BUILD_TIME` | Shared (non-secret) API key. Dedicated Last.fm API Key for music discovery and recommendation fallback (defaults to built-in shared key).                    |
| `NEXT_PUBLIC_LASTFM_API_KEY` | ➖ Optional    | `RUN_AND_BUILD_TIME` | Shared (non-secret) Last.fm API key for client-side requests (defaults to built-in shared key). Inlined into the client bundle at build time.                |
| `DAYWALKER_SIGNING_KEY`      | ⚠️ Recommended | `RUN_TIME`           | 🔒 **Secret.** Ed25519 PKCS#8 key used to sign outbound validate requests with RFC 9421 / RFC 9530 HTTP Message Signatures.                                  |
| `DAYWALKER_KEY_ID`           | ➖ Optional    | `RUN_TIME`           | RFC 7638 JWK thumbprint or key identifier registered in Daywalker Auth.                                                                                      |
| `DAYWALKER_PUBLIC_KEY`       | ➖ Optional    | `RUN_TIME`           | Optional Daywalker public key / JWK for zero-egress offline JWT token lease verification.                                                                    |
| `APP_URL`                    | ➖ Optional    | `RUN_TIME`           | Public origin (`https://sonalyze.daywalker.dev`). Used as the signing domain.                                                                                |
| `STORAGE_MODE`               | ➖ Optional    | `RUN_TIME`           | `browser` (default) or `postgres`. When unset, Postgres is used automatically if `DATABASE_URL` is set.                                                      |
| `DATABASE_URL`               | ➖ Optional    | `RUN_TIME`           | 🔒 **Secret.** Postgres connection string (`postgres://user:pass@host:5432/db`). Enables database storage.                                                   |
| `DATABASE_READ_URL`          | ➖ Optional    | `RUN_TIME`           | 🔒 **Secret.** Read-only replica connection string. History and tag reads use it; writes always use `DATABASE_URL`. Falls back to `DATABASE_URL` when unset. |
| `NODE_ENV`                   | ➖ Optional    | `RUN_AND_BUILD_TIME` | Application environment mode (`production` / `development`).                                                                                                 |

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

## 🛡️ 5. Daywalker Service Authorization

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

## 🗄️ Storage Modes

Sonalyze supports two storage modes, selected by environment variables. No code changes are needed.

| Feature                                          | Browser (default) | Postgres |
| :----------------------------------------------- | :---------------: | :------: |
| Spotify login (stateless JWT cookie)             |        ✅         |    ✅    |
| Profile and preferences cached in `localStorage` |        ✅         |    ✅    |
| Preferences and profile synced across devices    |        ❌         |    ✅    |
| Listening history snapshots and trends page      |        ❌         |    ✅    |
| Custom track tags                                |        ❌         |    ✅    |

### Browser mode (default)

Leave `DATABASE_URL` unset. Nothing else is required.

### Postgres mode

1. Start Postgres (for example `docker compose --profile postgres up -d db`).
2. Set `DATABASE_URL=postgres://<user>:<password>@localhost:5432/<database>` in `.env.local`.
3. Run `node scripts/migrate.mjs` once for local development. Containers apply migrations automatically on start.

Notes:

- Mode is resolved on the server and exposed at `GET /api/storage/capabilities`. The UI hides History and tag controls in browser mode.
- If `DATABASE_URL` is set but the database is unreachable, the app falls back to browser mode instead of crashing.
- Spotify tokens are never stored in the database. Rows are keyed by Spotify user id.
- Existing `localStorage` data is not imported automatically. Preferences sync from the database after the first login.
- Set `DATABASE_READ_URL` to route read-heavy queries (history, tags) to a read-only replica. Preferences and all writes stay on the primary to avoid replica lag.
- Use a dedicated database and a dedicated user for Sonalyze only, and use that same user for `DATABASE_URL` and `DATABASE_READ_URL`. Never commit connection strings or hostnames.
- Set `STORAGE_MODE=browser` to force browser mode even when `DATABASE_URL` is set.

---

## 💻 6. Local Development & Cloning

### System Requirements

- **Node.js**: `>=22.0.0` (Active LTS / v24 recommended, managed via `.nvmrc` / `.node-version`)
- **npm**: `>=10.0.0` (enforced via `engine-strict` in `.npmrc` and `packageManager` specification)

### Step-by-Step Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Shelbyb/sonalyze.git
   cd sonalyze
   ```

2. **Select Node Version & Install Dependencies**:

   ```bash
   # Switch to supported Node version
   nvm use

   # Install dependencies with strict engine validation
   npm install
   ```

3. **Configure Local Environment**:

   ```bash
   cp .env.local.example .env.local
   ```

   Open `.env.local` and provide your `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, generated `NEXTAUTH_SECRET`, and free `DAYWALKER_API_KEY`.

4. **Start Development Server with TLS**:
   ```bash
   npm run dev:secure
   ```
   Open [https://localhost:3000](https://localhost:3000) in your browser.

---

## 🧪 7. Testing, Quality Assurance & Linting

### Code Formatting & Linting Standards

Sonalyze enforces automated code formatting via Prettier with Tailwind CSS class sorting, alongside ESLint flat configuration for static analysis and type safety:

```bash
# Check code formatting with Prettier
npm run format:check

# Auto-format all codebase files
npm run format

# Run ESLint static analysis
npm run lint

# Run TypeScript compiler type validation
npm run typecheck
```

### Run Full Quality & Pre-Deployment Validation:

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

## ☁️ 8. DigitalOcean App Platform Deployment

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
   - `APP_URL`: `https://sonalyze.daywalker.dev`
   - `NODE_ENV`: `production`
4. Register the live callback URL (`https://<your_domain>/api/auth/callback/spotify`) with the Spotify Developer Dashboard.

---

## 🔒 9. Security & Hardening Safeguards

- **Stateless Cookies**: Zero server-side session persistence. Sessions and Spotify tokens never touch a database. In Postgres mode only profile, preferences, history snapshots and tags are stored.
- **Strict Content Security & Headers**:
  - `Strict-Transport-Security` (max-age=63072000; preload)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (disables camera, microphone, geolocation)
- **Zero Production Vulnerabilities**: `npm audit --omit=dev` verified with 0 vulnerabilities.
- **Unprivileged Container**: Runs on Alpine Linux as non-root `nextjs:nodejs` user.

---

## 🩺 10. Troubleshooting

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

### Postgres mode shows browser-mode behavior

**Problem**

History and tag controls are missing even though `DATABASE_URL` is set.

**Fix**

1. Open `/api/storage/capabilities`. A `warning` field means the database is unreachable.
2. Check the connection string and that Postgres is running (`docker compose --profile postgres ps`).
3. Run `node scripts/migrate.mjs` and check its output. Also check that `STORAGE_MODE` is not set to `browser`.

---

## 🐳 Docker & Compose

```bash
# Browser mode (default)
docker compose up --build

# Postgres mode: set DATABASE_URL=postgres://<user>:<password>@db:5432/<database> in .env, then
docker compose --profile postgres up --build
```

The image entrypoint runs `scripts/migrate.mjs` only when `DATABASE_URL` is set, then starts `server.js`. For DigitalOcean, see the commented optional `DATABASE_URL` and `databases` blocks in [`.do/app.yaml`](./.do/app.yaml) and [`.do/deploy.template.yaml`](./.do/deploy.template.yaml).
