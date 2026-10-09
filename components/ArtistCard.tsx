import React from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { SpotifyArtist } from '@/types/spotify';

export default function ArtistCard({
  artist,
  rank,
}: {
  artist: SpotifyArtist;
  rank?: number;
}) {
  const img = artist.images?.[0]?.url;
  const name = artist.name || 'Unknown Artist';
  const spotifyUrl = artist.external_urls?.spotify || `https://open.spotify.com/artist/${artist.id}`;

  return (
    <a
      data-testid="artist-card"
      href={spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-panel/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-panel hover:shadow-xl"
    >
      {typeof rank === 'number' && (
        <span className="absolute left-3 top-3 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-elevated/90 px-2 font-display text-[11px] font-bold text-cream shadow">
          #{rank}
        </span>
      )}
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-full bg-elevated2 shadow-lg ring-1 ring-white/10 group-hover:ring-accent/40 transition-all">
        {img ? (
          <Image
            src={img}
            alt={name}
            fill
            sizes="(max-width: 640px) 160px, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-subtle">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="truncate font-display text-sm font-semibold tracking-tight text-cream group-hover:text-accent transition-colors">
        {name}
      </h3>
      {artist.genres && artist.genres.length > 0 ? (
        <p className="mt-1 truncate text-xs text-subtle capitalize">
          {artist.genres.slice(0, 2).join(' · ')}
        </p>
      ) : (
        <p className="mt-1 text-xs text-subtle italic">Artist</p>
      )}
      <ExternalLink className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}
