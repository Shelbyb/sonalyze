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
  const spotifyUrl =
    artist.external_urls?.spotify || `https://open.spotify.com/artist/${artist.id}`;

  return (
    <a
      data-testid="artist-card"
      href={spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="group bg-panel/50 hover:border-accent/40 hover:bg-panel relative flex flex-col overflow-hidden rounded-2xl border border-white/8 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {typeof rank === 'number' && (
        <span className="bg-elevated/90 font-display text-cream absolute top-3 left-3 z-10 flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-bold shadow">
          #{rank}
        </span>
      )}
      <div className="bg-elevated2 group-hover:ring-accent/40 relative mb-4 aspect-square w-full overflow-hidden rounded-full shadow-lg ring-1 ring-white/10 transition-all">
        {img ? (
          <Image
            src={img}
            alt={name}
            fill
            sizes="(max-width: 640px) 160px, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-subtle flex h-full w-full items-center justify-center text-2xl font-bold">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="font-display text-cream group-hover:text-accent truncate text-sm font-semibold tracking-tight transition-colors">
        {name}
      </h3>
      {artist.genres && artist.genres.length > 0 ? (
        <p className="text-subtle mt-1 truncate text-xs capitalize">
          {artist.genres.slice(0, 2).join(' · ')}
        </p>
      ) : (
        <p className="text-subtle mt-1 text-xs italic">Artist</p>
      )}
      <ExternalLink className="text-muted absolute top-3.5 right-3.5 h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}
