import type { Metadata } from 'next';
import { Sora, Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';
import { validateServiceToken } from '@/lib/daywalker-auth';
import ServiceErrorPage from '@/app/service-error/page';

export const dynamic = 'force-dynamic';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://sonalyze.daywalker.dev'),
  title: {
    default: 'Sonalyze — See your sound',
    template: '%s | Sonalyze',
  },
  description:
    'Sonalyze transforms Spotify listening history into interactive visual profiles: 30-second audio previews, audio DNA radar charts, sonic archetypes, CSV data exports, and smart playlist generation with direct Spotify synchronization.',
  icons: {
    icon: '/brand/logo-128.png',
    apple: '/brand/logo-192.png',
    shortcut: '/brand/logo-128.png',
  },
  openGraph: {
    title: 'Sonalyze — Audio Intelligence & Spotify Listening Visualizer',
    description:
      'Transform your Spotify listening history into interactive visual profiles, audio DNA radar charts, and customized playlists.',
    url: 'https://sonalyze.daywalker.dev',
    siteName: 'Sonalyze',
    images: [
      {
        url: '/brand/logo-512.png',
        width: 512,
        height: 512,
        alt: 'Sonalyze Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sonalyze — See your sound',
    description:
      'Explore your Spotify taste profile, audio DNA radar charts, and sonic archetypes with Sonalyze.',
    images: ['/brand/logo-512.png'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authResult = await validateServiceToken();

  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="font-body bg-base text-cream antialiased pb-20 lg:pb-0">
        <Providers>
          {authResult.valid ? children : <ServiceErrorPage />}
        </Providers>
      </body>
    </html>
  );
}
