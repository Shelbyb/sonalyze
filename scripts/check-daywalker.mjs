/* global process, console */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

export function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
}

export function collectProblems() {
  const problems = [];

  // 1. Check package.json (exact pin and hooks)
  const pkgPath = join(rootDir, 'package.json');
  if (!existsSync(pkgPath)) {
    problems.push('package.json not found');
  } else {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const sdkVersion = pkg.dependencies?.['@shelbyb/daywalker-sdk'];
      if (!sdkVersion) {
        problems.push(
          '@shelbyb/daywalker-sdk is missing from dependencies in package.json',
        );
      } else if (sdkVersion !== '0.9.1') {
        problems.push(
          `@shelbyb/daywalker-sdk must be exactly pinned to '0.9.1' (found '${sdkVersion}')`,
        );
      }

      if (
        !pkg.scripts?.prebuild ||
        !pkg.scripts.prebuild.includes('scripts/check-daywalker.mjs')
      ) {
        problems.push(
          'package.json must contain prebuild script running scripts/check-daywalker.mjs',
        );
      }

      if (
        !pkg.scripts?.prestart ||
        !pkg.scripts.prestart.includes('scripts/check-daywalker.mjs')
      ) {
        problems.push(
          'package.json must contain prestart script running scripts/check-daywalker.mjs',
        );
      }
    } catch (e) {
      problems.push(`Failed to parse package.json: ${e.message}`);
    }
  }

  // 2. Check installed SDK version
  const installedPkgPath = join(
    rootDir,
    'node_modules',
    '@shelbyb/daywalker-sdk',
    'package.json',
  );
  if (!existsSync(installedPkgPath)) {
    problems.push('@shelbyb/daywalker-sdk is not installed in node_modules');
  } else {
    try {
      const installedPkg = JSON.parse(readFileSync(installedPkgPath, 'utf8'));
      if (installedPkg.version !== '0.9.1') {
        problems.push(
          `Installed @shelbyb/daywalker-sdk version is ${installedPkg.version}, expected 0.9.1`,
        );
      }
    } catch (e) {
      problems.push(
        `Failed to parse installed @shelbyb/daywalker-sdk package.json: ${e.message}`,
      );
    }
  }

  // 3. Check package-lock.json integrity and version
  const lockPath = join(rootDir, 'package-lock.json');
  if (!existsSync(lockPath)) {
    problems.push('package-lock.json not found');
  } else {
    try {
      const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
      const pkgEntry =
        lock.packages?.['node_modules/@shelbyb/daywalker-sdk'] ||
        lock.dependencies?.['@shelbyb/daywalker-sdk'];

      if (!pkgEntry) {
        problems.push('@shelbyb/daywalker-sdk entry missing in package-lock.json');
      } else {
        if (pkgEntry.version !== '0.9.1') {
          problems.push(
            `package-lock.json has @shelbyb/daywalker-sdk version ${pkgEntry.version}, expected 0.9.1`,
          );
        }
        if (!pkgEntry.integrity || typeof pkgEntry.integrity !== 'string') {
          problems.push(
            'package-lock.json entry for @shelbyb/daywalker-sdk is missing integrity field',
          );
        }
        if (!pkgEntry.resolved || typeof pkgEntry.resolved !== 'string') {
          problems.push(
            'package-lock.json entry for @shelbyb/daywalker-sdk is missing resolved field',
          );
        }
      }
    } catch (e) {
      problems.push(`Failed to parse package-lock.json: ${e.message}`);
    }
  }

  // 4. Check wrapper file (lib/daywalker-auth.ts or src/lib/daywalker-auth.ts)
  const wrapperPaths = [
    join(rootDir, 'lib', 'daywalker-auth.ts'),
    join(rootDir, 'src', 'lib', 'daywalker-auth.ts'),
  ];
  const wrapperPath = wrapperPaths.find(existsSync);
  if (!wrapperPath) {
    problems.push('Wrapper file lib/daywalker-auth.ts not found');
  } else {
    const raw = readFileSync(wrapperPath, 'utf8');
    const content = stripComments(raw);

    if (!content.includes('@shelbyb/daywalker-sdk')) {
      problems.push('Wrapper file must import @shelbyb/daywalker-sdk');
    }
    if (!/validateServiceCredentials\s*\(/.test(content)) {
      problems.push('Wrapper file must call validateServiceCredentials');
    }
    if (!/getLicense\s*\(/.test(content)) {
      problems.push('Wrapper file must call getLicense');
    }
    if (!/fetchBundle\s*\(/.test(content)) {
      problems.push('Wrapper file must call fetchBundle');
    }
    if (!/requireServiceLicense\s*\(/.test(content)) {
      problems.push('Wrapper file must call requireServiceLicense');
    }
  }

  // 5. Check guard files
  // 5a. Proxy/Middleware guard
  const middlewarePaths = [
    join(rootDir, 'middleware.ts'),
    join(rootDir, 'proxy.ts'),
    join(rootDir, 'src', 'middleware.ts'),
  ];
  const middlewarePath = middlewarePaths.find(existsSync);
  if (!middlewarePath) {
    problems.push('Middleware file (middleware.ts) not found');
  } else {
    const content = stripComments(readFileSync(middlewarePath, 'utf8'));
    if (!/validateServiceToken\s*\(/.test(content)) {
      problems.push('Middleware file must call validateServiceToken');
    }
  }

  // 5b. Readiness guard (app/api/health/route.ts or app/healthz/route.ts)
  const readinessPaths = [
    join(rootDir, 'app', 'api', 'health', 'route.ts'),
    join(rootDir, 'src', 'app', 'api', 'health', 'route.ts'),
  ];
  const readinessPath = readinessPaths.find(existsSync);
  if (!readinessPath) {
    problems.push('Readiness file app/api/health/route.ts not found');
  } else {
    const content = stripComments(readFileSync(readinessPath, 'utf8'));
    if (!/requireServiceAuth\s*\(/.test(content)) {
      problems.push('Readiness endpoint must call requireServiceAuth');
    }
    if (!/requireServiceLicense\s*\(/.test(content)) {
      problems.push('Readiness endpoint must call requireServiceLicense');
    }
  }

  // 5c. Database guard (lib/db/client.ts or src/lib/db/client.ts)
  const dbPaths = [
    join(rootDir, 'lib', 'db', 'client.ts'),
    join(rootDir, 'src', 'lib', 'db', 'client.ts'),
  ];
  const dbPath = dbPaths.find(existsSync);
  if (!dbPath) {
    problems.push('Database file lib/db/client.ts not found');
  } else {
    const content = stripComments(readFileSync(dbPath, 'utf8'));
    const defMatches =
      content.match(
        /(?:function\s+assertServiceAuthorized|const\s+assertServiceAuthorized\s*=)/g,
      ) || [];
    if (defMatches.length !== 1) {
      problems.push(
        `Database file must define assertServiceAuthorized exactly once (found ${defMatches.length})`,
      );
    }

    const callMatches = content.match(/assertServiceAuthorized\s*\(/g) || [];
    // Subtract 1 if the definition syntax used function assertServiceAuthorized(...)
    const actualCalls = callMatches.length - defMatches.length;
    if (actualCalls < 3) {
      problems.push(
        `Database file must call assertServiceAuthorized at least 3 times (found ${actualCalls})`,
      );
    }
  }

  // 6. Check Dockerfile
  const dockerfilePath = join(rootDir, 'Dockerfile');
  if (!existsSync(dockerfilePath)) {
    problems.push('Dockerfile not found');
  } else {
    const content = readFileSync(dockerfilePath, 'utf8');
    if (!content.includes('npm ci')) {
      problems.push('Dockerfile must run npm ci');
    }
    if (
      !content.includes('node scripts/check-daywalker.mjs') &&
      !content.includes('scripts/check-daywalker.mjs')
    ) {
      problems.push('Dockerfile must run scripts/check-daywalker.mjs');
    }
  }

  // 7. Check required policy, governance, and workflow files
  const requiredFiles = [
    join(rootDir, '.github', 'CODEOWNERS'),
    join(rootDir, 'AGENTS.md'),
    join(rootDir, 'CLAUDE.md'),
    join(rootDir, 'SDK.md'),
    join(rootDir, '.github', 'workflows', 'ci.yml'),
  ];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      const relPath = file.replace(rootDir + '/', '');
      problems.push(`Required file ${relPath} does not exist`);
    }
  }

  return problems;
}

// CLI execution
if (
  process.argv[1] &&
  (pathToFileURL(process.argv[1]).href === import.meta.url ||
    process.argv[1].endsWith('check-daywalker.mjs'))
) {
  const problems = collectProblems();
  if (problems.length > 0) {
    console.error('❌ Daywalker SDK check failed with the following problems:');
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  } else {
    console.log('✅ Daywalker SDK integrity checks passed.');
    process.exit(0);
  }
}
