# Sonalyze — Audio Intelligence & Spotify Listening Visualizer

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.0-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Test_Coverage-88%25-1ed760?style=for-the-badge&logo=vitest&logoColor=black" alt="88% Coverage" />
  <img src="https://img.shields.io/badge/E2E_Tests-Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright E2E" />
  <img src="https://img.shields.io/badge/Security-0_Vulnerabilities-success?style=for-the-badge&logo=shield" alt="Security" />
  <img src="https://img.shields.io/badge/DigitalOcean-App_Platform-0080FF?style=for-the-badge&logo=digitalocean&logoColor=white" alt="DigitalOcean" />
  <img src="https://img.shields.io/badge/Demo-sonalyze.daywalker.dev-purple?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
</p>

> 🚀 **Live Working Demo**: [https://sonalyze.daywalker.dev](https://sonalyze.daywalker.dev)

**Sonalyze** is a high-performance web application that transforms Spotify listening data into interactive visual profiles: 30-second streaming audio previews, real-time client-side search and filtering, audio DNA radar charts, sonic archetype analysis, CSV data exports, and smart playlist generation with direct Spotify synchronization.

No central database is required. Sessions are stored securely in browser-encrypted JWT cookies via NextAuth.

---

## 🎛️ Tech Stack Carousel

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SONALYZE TECH STACK                                    │
├───────────────┬─────────────────┬────────────────┬───────────────────┬─────────────────┤
│   Framework   │     Styling     │ Authentication │   Visualization   │     Testing     │
├───────────────┼─────────────────┼────────────────┼───────────────────┼─────────────────┤
│  Next.js 16   │ Tailwind CSS v4 │  NextAuth.js   │     Recharts      │  Vitest (87%+)  │
│  (Turbopack)  │    + PostCSS    │  (JWT Cookies) │  (Radar / Bar)    │ Playwright E2E  │
└───────────────┴─────────────────┴────────────────┴───────────────────┴─────────────────┘
```

| Technology | Purpose & Implementation |
| :--- | :--- |
| **Next.js 16** | App Router, Turbopack compilation, standalone container output, and route streaming. |
| **Tailwind CSS v4** | Modern CSS theme engine with GPU-accelerated micro-animations and responsive grid. |
| **NextAuth.js** | Stateless Spotify OAuth 2.0 provider with automatic token refreshing and HTTP-only JWTs. |
| **Recharts** | Interactive vector radar charts and bar charts for audio DNA and genre distribution. |
| **Lucide React** | Streamlined SVG icon system for UI controls and music indicators. |
| **Vitest & Playwright**| 87%+ line test coverage across all components and API utilities, plus cross-browser E2E testing. |
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

## 🌐 Live Production Demo & Domain

- **Live Production URL**: [https://sonalyze.daywalker.dev](https://sonalyze.daywalker.dev)
- **Subdomain**: `sonalyze.daywalker.dev` (DigitalOcean App Platform)
- **Spotify OAuth Callback**: `https://sonalyze.daywalker.dev/api/auth/callback/spotify`
- **Container Health Check Endpoints**:
  - `/api/health` — JSON status payload with uptime, timestamp, and HTTP 200 response
  - `/healthz` — Lightweight liveness/readiness probe compliant with DigitalOcean and Kubernetes standards

---

## 🛠️ 1. Spotify Developer Setup

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **Create app**.
3. In **Redirect URIs**, add:
   - **Local development**: `http://localhost:3000/api/auth/callback/spotify`
   - **Production**: `https://sonalyze.daywalker.dev/api/auth/callback/spotify` (and `https://sonalyze.ondigitalocean.app/api/auth/callback/spotify`)
4. Save and copy your **Client ID** and **Client Secret**.

---

## 🔑 2. Configure Environment Variables

Copy the example environment configuration file:

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
NEXTAUTH_URL=http://localhost:3000
```

### Environment Variables Reference

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `SPOTIFY_CLIENT_ID` | RUN_AND_BUILD_TIME, secret | Spotify Developer Application Client ID |
| `SPOTIFY_CLIENT_SECRET` | RUN_AND_BUILD_TIME, secret | Spotify Developer Application Client Secret |
| `NEXTAUTH_SECRET` | RUN_AND_BUILD_TIME, secret | Cryptographic secret used to sign and encrypt JWT cookies (`openssl rand -base64 48`) |
| `NEXTAUTH_URL` | RUN_AND_BUILD_TIME | Canonical authentication URL (`http://localhost:3000` locally, `${APP_URL}` in production) |
| `NODE_ENV` | RUN_AND_BUILD_TIME | Application environment mode (`production` / `development`) |

---

## 💻 3. Local Development

Install dependencies and start the secure development server:

```bash
npm install
npm run dev:secure
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 4. Testing & Quality Assurance

### Run Unit Tests & Coverage (87%+ Covered):
```bash
npm run test:coverage
```

### Run Playwright E2E Tests:
```bash
npm run test:e2e
```

---

## ☁️ 5. DigitalOcean App Platform Deployment

The repository is pre-configured with `.do/app.yaml` and a hardened, multi-stage `Dockerfile` (`output: "standalone"`).

### Deploy via Control Panel or doctl CLI
1. Push this repository to your GitHub repo (`Shelbyb/sonalyze`).
2. DigitalOcean App Platform automatically builds the multi-stage Docker image and executes health checks against `/api/health` before routing live traffic.
3. Under **Environment Variables**, configure:
   - `SPOTIFY_CLIENT_ID`: Your client ID (Encrypted Secret)
   - `SPOTIFY_CLIENT_SECRET`: Your client secret (Encrypted Secret)
   - `NEXTAUTH_SECRET`: Random 48-byte cryptographic secret (Encrypted Secret, generate with `openssl rand -base64 48`)
   - `NEXTAUTH_URL`: `${APP_URL}`
   - `NODE_ENV`: `production`
4. Register the live callback URL (`https://sonalyze.daywalker.dev/api/auth/callback/spotify`) with the Spotify Developer Dashboard.

---

## 🔒 6. Security & Hardening Safeguards

- **Stateless Cookies**: Zero server-side session persistence.
- **Strict Content Security & Headers**:
  - `Strict-Transport-Security` (max-age=63072000; preload)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (disables camera, microphone, geolocation)
- **Zero Production Vulnerabilities**: `npm audit --omit=dev` verified with 0 vulnerabilities.
- **Unprivileged Container**: Runs on Alpine Linux as non-root `nextjs:nodejs` user.
