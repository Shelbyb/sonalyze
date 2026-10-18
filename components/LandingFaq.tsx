'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How does Sonalyze access my Spotify data?',
    a: 'Sonalyze connects directly via official Spotify OAuth 2.0 PKCE authentication. We only request read permissions for your top artists, tracks, and listening history, plus playlist creation scope if you choose to export generated mixes.',
  },
  {
    q: 'Is my Spotify password or listening history stored on your servers?',
    a: 'No. Sonalyze operates with a 100% stateless architecture. There is zero database storage. Your session tokens are encrypted directly inside an HTTP-only browser cookie signed by NextAuth and are never shared or persisted on any server.',
  },
  {
    q: 'What is Audio DNA and how is it calculated?',
    a: 'Audio DNA analyzes 9+ acoustic metrics extracted by Spotify audio engineers: Danceability, Energy, Valence (musical positivity), Acousticness, Instrumentalness, Liveness, Speechiness, Camelot Key notation, and Tempo (BPM). Sonalyze graphs these into interactive radar signatures.',
  },
  {
    q: 'Can I listen to track previews without opening the Spotify desktop app?',
    a: 'Yes! Sonalyze includes an integrated global 30-second streaming preview player. You can listen inline across Top Tracks, Recently Played, and Discover views, complete with waveform equalizers and keyboard controls (press Space to toggle playback).',
  },
  {
    q: 'How does the AI Playlist Generator work?',
    a: 'You can select any playlist in your library as a seed. Sonalyze extracts acoustic traits, lets you fine-tune energy and danceability sliders, generates 20 tailored recommendations, and lets you save the curated mix straight to your personal Spotify account with one click.',
  },
  {
    q: 'Can I export my listening history and analytics to CSV?',
    a: 'Yes. With one click on any tracks or history page, Sonalyze generates a cleanly formatted spreadsheet containing rank, title, artists, album, popularity, duration, and direct Spotify links for easy archiving.',
  },
];

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="bg-panel/40 mx-auto max-w-3xl divide-y divide-white/8 rounded-2xl border border-white/8 p-2 backdrop-blur sm:p-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-3">
            <button
              onClick={() => toggle(idx)}
              className="font-display text-cream hover:text-accent flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-base font-semibold transition-colors focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="text-accent h-4 w-4 shrink-0" />
                {faq.q}
              </span>
              <ChevronDown
                className={`text-muted h-5 w-5 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'text-accent rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="text-muted animate-rise px-4 pt-1 pb-4 text-sm leading-relaxed">
                <div className="border-accent/40 text-muted/90 border-l-2 pl-4">
                  {faq.a}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
