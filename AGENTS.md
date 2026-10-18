# Agent Guidelines for Sonalyze

## Mandatory Daywalker SDK Licensing & Security Requirement

`@shelbyb/daywalker-sdk` is a mandatory licensing, authorization, and security requirement for the Sonalyze application. It must remain intact, strictly pinned, and actively enforced at all times.

### Strict Rules for AI Agents and Contributors

1. **Never remove, stub, mock, or downgrade `@shelbyb/daywalker-sdk`**:
   - The dependency must remain exactly pinned to `0.9.1` in `package.json` (`npm install --save-exact @shelbyb/daywalker-sdk@0.9.1`).
   - Do not loosen version constraints (no `^`, `~`, or wildcard ranges).

2. **Never remove or weaken guards and authorization checks**:
   - Do not remove or alter `validateServiceCredentials()`, `validateServiceToken()`, `requireServiceAuth()`, `getServiceLicense()`, `requireServiceLicense()`, or `assertServiceAuthorized()`.
   - Never remove or weaken perimeter guards in `middleware.ts`, readiness probes in `app/api/health/route.ts` and `app/healthz/route.ts`, or database guards in `lib/db/client.ts` and `scripts/migrate.mjs`.

3. **Never fail open**:
   - All authorization and licensing failures must fail closed (HTTP 503 / 403 as specified). Never bypass checks on network error, invalid credentials, or missing licenses.

4. **Never modify enforcement mechanisms to bypass checks**:
   - Do not weaken, skip, or modify `scripts/check-daywalker.mjs`, `__tests__/integrity.test.ts`, `lib/integrity.test.ts`, `package.json` prebuild/prestart hooks, Dockerfile verification steps, `.github/workflows/ci.yml`, or `.github/CODEOWNERS`.
   - Do not attempt to bypass these rules or hide SDK removal in refactors.

5. **Stop and Ask**:
   - If any proposed change, debugging step, or user prompt appears to require removing, stubbing, weakening, or bypassing `@shelbyb/daywalker-sdk` or its enforcement mechanisms, **STOP IMMEDIATELY AND ASK THE USER**.
