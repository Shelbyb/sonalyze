# Claude Code Guidelines for Sonalyze

Refer to [AGENTS.md](./AGENTS.md) for all project-wide rules, coding standards, and security requirements.

In particular, note that `@shelbyb/daywalker-sdk@^0.10.0` is mandatory and must not be removed, downgraded, mocked, or bypassed under any circumstances. Always fail closed and stop to ask for confirmation if any changes touch SDK integrity.
