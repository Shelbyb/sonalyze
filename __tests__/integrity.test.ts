import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { collectProblems, stripComments } from '../scripts/check-daywalker.mjs';

const rootDir = process.cwd();

describe('Daywalker SDK Integrity & Policy Compliance', () => {
  it('collectProblems() returns an empty list of problems', () => {
    const problems = collectProblems();
    expect(problems).toEqual([]);
  });

  it('verifies exact version pin and npm pre-hooks exist in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    expect(pkg.dependencies['@shelbyb/daywalker-sdk']).toBe('0.17.0');
    expect(pkg.scripts.prebuild).toContain('scripts/check-daywalker.mjs');
    expect(pkg.scripts.prestart).toContain('scripts/check-daywalker.mjs');
  });

  it('verifies guard calls exist in proxy, readiness, and database files', () => {
    // 1. Proxy / Middleware
    const middlewareContent = stripComments(
      readFileSync(join(rootDir, 'middleware.ts'), 'utf8'),
    );
    expect(middlewareContent).toContain('validateServiceToken');

    // 2. Readiness probe
    const readinessContent = stripComments(
      readFileSync(join(rootDir, 'app/api/health/route.ts'), 'utf8'),
    );
    expect(readinessContent).toContain('requireServiceAuth');
    expect(readinessContent).toContain('requireServiceLicense');

    // 3. DB client
    const dbContent = stripComments(
      readFileSync(join(rootDir, 'lib/db/client.ts'), 'utf8'),
    );
    const defMatches =
      dbContent.match(
        /(?:function\s+assertServiceAuthorized|const\s+assertServiceAuthorized\s*=)/g,
      ) || [];
    expect(defMatches.length).toBe(1);

    const callMatches = dbContent.match(/assertServiceAuthorized\s*\(/g) || [];
    const actualCalls = callMatches.length - defMatches.length;
    expect(actualCalls).toBeGreaterThanOrEqual(3);
  });

  it('verifies CODEOWNERS covers package.json, scripts/, guard files, Dockerfile, and .github/', () => {
    const codeownersPath = join(rootDir, '.github', 'CODEOWNERS');
    expect(existsSync(codeownersPath)).toBe(true);

    const codeowners = readFileSync(codeownersPath, 'utf8');
    expect(codeowners).toMatch(/package\.json\s+@Shelbyb/);
    expect(codeowners).toMatch(/scripts\/\s+@Shelbyb/);
    expect(codeowners).toMatch(/middleware\.ts\s+@Shelbyb/);
    expect(codeowners).toMatch(/app\/api\/health\/route\.ts\s+@Shelbyb/);
    expect(codeowners).toMatch(/lib\/db\/client\.ts\s+@Shelbyb/);
    expect(codeowners).toMatch(/Dockerfile\s+@Shelbyb/);
    expect(codeowners).toMatch(/\.github\/\s+@Shelbyb/);
  });
});
