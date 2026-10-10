/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['@shelbyb/daywalker-sdk'],
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      { protocol: 'https', hostname: 'image-cdn-ak.spotifycdn.com' },
      { protocol: 'https', hostname: 'image-cdn-fa.spotifycdn.com' },
      { protocol: 'https', hostname: 'seed-mix-image.spotifycdn.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://i.scdn.co https://mosaic.scdn.co https://image-cdn-ak.spotifycdn.com https://image-cdn-fa.spotifycdn.com https://seed-mix-image.spotifycdn.com https://platform-lookaside.fbsbx.com; media-src 'self' https://p.scdn.co https://*.scdn.co blob:; connect-src 'self' https://api.spotify.com https://accounts.spotify.com; font-src 'self' data:; frame-ancestors 'none';",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
