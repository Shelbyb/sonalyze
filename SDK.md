# Daywalker SDK & Service Licensing Integration

## Overview

Sonalyze integrates `@shelbyb/daywalker-sdk` (version: `^0.10.0`) for cryptographic service authorization, runtime licensing, and integrity protection. This document details the SDK requirements, architecture, guards, cryptographic secret derivations, and enforcement verification procedures.

---

## Architecture & Integration Details

### 1. Dependency Pinning & Packaging

- **Package Version**: `@shelbyb/daywalker-sdk@^0.10.0` installed via semver range (`npm install @shelbyb/daywalker-sdk@^0.10.0`).
- **Integrity**: Verified in `package-lock.json` with hash integrity and version match.
- **Build / Start Hooks**: `prebuild` and `prestart` in `package.json` invoke `node scripts/check-daywalker.mjs` before compilation or server initialization.

### 2. Service Authentication & Licensing Wrapper (`lib/daywalker-auth.ts`)

- **Service Slug**: `sonalyze` (configured via `DAYWALKER_SERVICE_SLUG` or defaults to `sonalyze`).
- **Service Credential Validation**: `validateServiceToken()` invokes `client.validateServiceCredentials({ serviceSlug, forceRefresh })` with a 5-second timeout, failing closed with HTTP 503 upon any network or unexpected error.
- **Service Licensing**:
  - `getServiceLicense()` and `requireServiceLicense()` fetch the 1-hour service license (`client.getLicense({ serviceSlug })`) and encrypted config bundle (`client.fetchBundle({ serviceSlug })`).
  - Responses are cached in memory until 1 minute prior to expiration.
  - Failures map `DaywalkerAuthError` to structured `{ status, code }` payloads and network timeouts/outages to HTTP 503.
- **Runtime Secret Derivation**:
  - Derived via HKDF-SHA256:
    ```ts
    runtimeSecret =
      HKDF -
      SHA256(
        (ikm = licenseKey),
        (salt = bundle.dataKeySalt),
        (info = 'sonalyze-runtime-v1'),
      );
    ```
  - `licenseKey`, `dataKeySalt`, and `runtimeSecret` are never logged.
- **SDK Integrity Guard**: `assertSdkIntact()` validates that `Daywalker.prototype` contains `validateServiceCredentials`, `getLicense`, and `fetchBundle`.

### 3. Multi-Layer Guards

- **Perimeter / Request Middleware (`middleware.ts`)**:
  - Invokes `validateServiceToken()` on incoming requests.
  - Applies `createDaywalkerServiceHealthMiddleware` for routing degraded/revoked services to `/service-error`.
- **Readiness Probes (`app/api/health/route.ts`, `app/healthz/route.ts`)**:
  - Calls `requireServiceAuth()` and `requireServiceLicense()` to ensure service health and license validity before accepting container traffic.
- **Database & Migration Entrypoints (`lib/db/client.ts`, `scripts/migrate.mjs`)**:
  - `assertServiceAuthorized()` ensures `assertSdkIntact()`, `requireServiceAuth()`, and `requireServiceLicense()` succeed prior to database query execution or schema migration.
  - Cached for 60 seconds per instance, active in server runtime, and skipped during build phase (`NEXT_PHASE === 'phase-production-build'`).

### 4. Secret Derivation & Cookie Encryption (`lib/encryption.ts`)

- Master secrets and encryption keys are derived with the Daywalker runtime secret when available.
- Fallback keys maintain backward compatibility for reading previously stored ciphertext during license rotations.

---

## Verification & Hardening

### Automated Checks

- `scripts/check-daywalker.mjs`: Scans the repository and validates:
  1. Valid semver range (`^0.10.0`) in `package.json`
  2. Installation in `node_modules`
  3. `package-lock.json` integrity and version match
  4. `prebuild` and `prestart` hook definitions
  5. Wrapper SDK imports and method invocations (`validateServiceCredentials`, `getLicense`, `fetchBundle`, `requireServiceLicense`)
  6. Comment-stripped guard checks in `middleware.ts`, `app/api/health/route.ts`, and `lib/db/client.ts`
  7. Database guard defined once and called at least 3 times
  8. `Dockerfile` running `npm ci` and `scripts/check-daywalker.mjs`
  9. Governance files present: `.github/CODEOWNERS`, `AGENTS.md`, `CLAUDE.md`, `SDK.md`, and `.github/workflows/ci.yml`

### Automated Tests

- `__tests__/integrity.test.ts` & `lib/integrity.test.ts`: Runs `collectProblems()` and validates guard invocations and CODEOWNERS rules.
- `__tests__/daywalker-auth.test.tsx`: Tests mock and real client behaviors including success, `SERVICE_REVOKED` (403), network timeouts (503), and runtime secret derivation uniqueness across salt changes.

---

## Governance & Security Policies

- **Branch Protection**: Requires Code Owner reviews (@Shelbyb) and CI pass before merging to `main`.
- **Fail Closed**: The system always fails closed (HTTP 503) on error. Bypassing or mocking the SDK in production code is strictly forbidden.

---

## Developer Onboarding

- `npm run setup` runs `daywalker onboard` (SDK `0.10.0`): account signup or login, email verification, service selection, API token creation (allowed origins: the app URL plus `https://localhost:3000`), and signing-key registration.
- `daywalker.onboard.mjs` at the repo root is the project hook. It prompts for the Spotify, Last.fm and `DATABASE_URL` values, generates `NEXTAUTH_SECRET`, sets `NEXTAUTH_URL` and `APP_URL` to the local origin, and prints the Spotify redirect-URI hint.
- Progress is stored in the gitignored `.daywalker-onboard.json` (never the password, token or keys). The hook is executable code, so the CLI asks for confirmation unless `--yes` is passed.
