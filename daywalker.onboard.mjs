// Project hook for `npx daywalker onboard` (SDK 0.17.0+).
const LOCAL = 'https://localhost:3000';

export default {
  defaultService: 'sonalyze',
  localOrigins: [LOCAL],
  env: [
    { key: 'SPOTIFY_CLIENT_ID', label: 'Spotify Client ID', required: true },
    {
      key: 'SPOTIFY_CLIENT_SECRET',
      label: 'Spotify Client Secret',
      required: true,
      hidden: true,
    },
    {
      key: 'LASTFM_API_KEY',
      label: 'Last.fm API key',
      mirrorTo: ['NEXT_PUBLIC_LASTFM_API_KEY'],
    },
    { key: 'DATABASE_URL', label: 'Postgres DATABASE_URL', hidden: true },
  ],
  generate: { NEXTAUTH_SECRET: 'base64-48' },
  fixed: { NEXTAUTH_URL: LOCAL, APP_URL: LOCAL },
  nextSteps: () => [
    `In the Spotify Developer Dashboard add the redirect URI: ${LOCAL}/api/auth/callback/spotify`,
    'Start the app: npm run dev:secure',
  ],
};
