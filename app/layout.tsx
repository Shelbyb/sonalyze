import type { Metadata } from 'next';
import { Sora, Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

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
  title: 'Sonalyze — See your sound',
  description:
    'Sonalyze turns your Spotify listening history into a visual, explorable profile — top artists, top tracks, recently played, audio DNA, and AI-assisted playlists built from your own taste.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="font-body bg-base text-cream antialiased pb-20 lg:pb-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
