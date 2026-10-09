import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginButton, { SpotifyIcon } from '@/components/LoginButton';
import MobileNav from '@/components/MobileNav';
import AlbumMosaic from '@/components/AlbumMosaic';
import Providers from '@/components/Providers';
import {
  TrackRowSkeleton,
  TrackListSkeleton,
  ArtistCardSkeleton,
  ArtistGridSkeleton,
  StatCardSkeleton,
} from '@/components/Skeleton';
import { AudioPlayerProvider, useAudioPlayer } from '@/components/AudioPlayerContext';
import GlobalPlayer from '@/components/GlobalPlayer';
import PlaylistsPage from '@/app/dashboard/playlists/page';
import DiscoverPage from '@/app/dashboard/discover/page';
import LandingPage from '@/app/page';
import LandingHeroPreview from '@/components/LandingHeroPreview';
import LandingFaq from '@/components/LandingFaq';
import * as spotifyLib from '@/lib/spotify';
import { signIn, signOut } from 'next-auth/react';
import type { SpotifyTrack, SpotifyPlaylist } from '@/types/spotify';

describe('Extra Components and Edge Cases', () => {
  it('renders LoginButton in both sizes and triggers signIn', () => {
    const { rerender } = render(<LoginButton size="lg" label="Connect Spotify" />);
    expect(screen.getByText('Connect Spotify')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Connect Spotify'));
    expect(signIn).toHaveBeenCalledWith('spotify', { callbackUrl: '/dashboard' });

    rerender(<LoginButton size="md" label="Small Login" />);
    expect(screen.getByText('Small Login')).toBeInTheDocument();
  });

  it('renders SpotifyIcon standalone', () => {
    const { container } = render(<SpotifyIcon className="w-5 h-5" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders MobileNav with links and triggers signOut', () => {
    render(<MobileNav />);
    expect(screen.getByText('Sonalyze')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Tracks')).toBeInTheDocument();

    const logoutBtn = screen.getByText('Log out');
    fireEvent.click(logoutBtn);
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('renders AlbumMosaic grid cards', () => {
    const { container } = render(<AlbumMosaic />);
    expect(container.querySelectorAll('.aspect-square').length).toBeGreaterThan(0);
  });

  it('renders all skeleton loader variants', () => {
    render(
      <div>
        <TrackRowSkeleton />
        <TrackListSkeleton count={3} />
        <ArtistCardSkeleton />
        <ArtistGridSkeleton count={2} />
        <StatCardSkeleton />
      </div>
    );
    expect(screen.getAllByRole('generic').length).toBeGreaterThan(5);
  });

  it('renders Providers tree with children', () => {
    render(
      <Providers>
        <span data-testid="child-element">Child content</span>
      </Providers>
    );
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('handles AudioPlayerContext volume, mute, seek, and keyboard shortcut', async () => {
    const trackWithPreview: SpotifyTrack = {
      id: 't-preview',
      name: 'Karma Police',
      artists: [{ id: 'a1', name: 'Radiohead' }],
      album: { id: 'alb1', name: 'OK Computer', images: [{ url: 'https://example.com/art.jpg' }] },
      duration_ms: 240000,
      preview_url: 'https://p.scdn.co/preview.mp3',
      external_urls: { spotify: 'https://open.spotify.com/track/t-preview' },
    };

    const trackWithoutPreview: SpotifyTrack = {
      id: 't-nopreview',
      name: 'No Preview Song',
      artists: [{ id: 'a2', name: 'Artist' }],
      album: { id: 'alb2', name: 'Album', images: [] },
      duration_ms: 200000,
      preview_url: null,
      external_urls: { spotify: 'https://open.spotify.com/track/t-nopreview' },
    };

    function TestAudioControls() {
      const {
        playTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        volume,
        isMuted,
        hasPreview,
      } = useAudioPlayer();

      return (
        <div>
          <button onClick={() => playTrack(trackWithPreview)}>Play With Preview</button>
          <button onClick={() => playTrack(trackWithoutPreview)}>Play Without Preview</button>
          <button onClick={() => togglePlay()}>Toggle</button>
          <button onClick={() => seek(15)}>Seek 15</button>
          <button onClick={() => setVolume(0.5)}>Set Vol 0.5</button>
          <button onClick={() => toggleMute()}>Toggle Mute</button>
          <span data-testid="vol-val">{volume}</span>
          <span data-testid="mute-val">{isMuted ? 'muted' : 'unmuted'}</span>
          <span data-testid="preview-val">{hasPreview ? 'yes' : 'no'}</span>
        </div>
      );
    }

    await act(async () => {
      render(
        <AudioPlayerProvider>
          <TestAudioControls />
          <GlobalPlayer />
        </AudioPlayerProvider>
      );
    });

    // Play without preview
    await act(async () => {
      fireEvent.click(screen.getByText('Play Without Preview'));
    });
    expect(screen.getByTestId('preview-val')).toHaveTextContent('no');

    // Play with preview
    await act(async () => {
      fireEvent.click(screen.getByText('Play With Preview'));
    });
    expect(screen.getByTestId('preview-val')).toHaveTextContent('yes');

    // Change volume
    await act(async () => {
      fireEvent.click(screen.getByText('Set Vol 0.5'));
    });
    expect(screen.getByTestId('vol-val')).toHaveTextContent('0.5');

    // Mute
    await act(async () => {
      fireEvent.click(screen.getByText('Toggle Mute'));
    });
    expect(screen.getByTestId('mute-val')).toHaveTextContent('muted');

    // Unmute
    await act(async () => {
      fireEvent.click(screen.getByText('Toggle Mute'));
    });
    expect(screen.getByTestId('mute-val')).toHaveTextContent('unmuted');

    // Seek
    await act(async () => {
      fireEvent.click(screen.getByText('Seek 15'));
    });

    // Press space key on document
    await act(async () => {
      fireEvent.keyDown(window, { code: 'Space' });
    });
  });

  it('renders PlaylistsPage correctly even with playlists missing tracks or owner data', async () => {
    const mockPlaylists: any[] = [
      {
        id: 'pl-1',
        name: 'Chill Vibes',
        description: 'Mellow tunes',
        images: [{ url: 'https://example.com/chill.jpg' }],
        tracks: { total: 42 },
        owner: { display_name: 'Alex', id: 'alex' },
        external_urls: { spotify: 'https://open.spotify.com/playlist/pl-1' },
        public: true,
      },
      {
        id: 'pl-2',
        name: 'Radio Mix',
        description: null,
        images: [],
        tracks: undefined, // Missing tracks object
        owner: { display_name: undefined, id: 'unknown' },
        external_urls: undefined,
        public: false,
      },
      {
        id: 'pl-3',
        name: 'Single Track Playlist',
        description: 'Solo song',
        images: [],
        tracks: { total: 1 },
        owner: { display_name: 'DJ', id: 'dj' },
        external_urls: { spotify: 'https://open.spotify.com/playlist/pl-3' },
        public: true,
      },
    ];

    vi.spyOn(spotifyLib, 'getUserPlaylists').mockResolvedValueOnce({
      items: mockPlaylists,
      total: 3,
      limit: 50,
      offset: 0,
      href: '',
      next: null,
      previous: null,
    } as any);

    await act(async () => {
      render(<PlaylistsPage />);
    });

    expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
    expect(screen.getByText('42 tracks')).toBeInTheDocument();
    expect(screen.getByText('Radio Mix')).toBeInTheDocument();
    expect(screen.getByText('0 tracks')).toBeInTheDocument();
    expect(screen.getByText('Single Track Playlist')).toBeInTheDocument();
    expect(screen.getByText('1 track')).toBeInTheDocument();

    // Test Search filter
    const searchInput = screen.getByPlaceholderText('Search playlists…');
    fireEvent.change(searchInput, { target: { value: 'Chill' } });
    expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
    expect(screen.queryByText('Radio Mix')).not.toBeInTheDocument();

    // Test Privacy filter
    fireEvent.change(searchInput, { target: { value: '' } });
    const privateFilterBtn = screen.getByRole('button', { name: 'private' });
    fireEvent.click(privateFilterBtn);
    expect(screen.getByText('Radio Mix')).toBeInTheDocument();
    expect(screen.queryByText('Chill Vibes')).not.toBeInTheDocument();
  });

  it('renders DiscoverPage seed playlist selector safely when tracks is undefined', async () => {
    const mockPlaylists: any[] = [
      {
        id: 'pl-broken',
        name: 'Corrupted Playlist',
        tracks: undefined,
      },
      {
        id: 'pl-valid',
        name: 'Valid Playlist',
        tracks: { total: 15 },
      },
    ];

    vi.spyOn(spotifyLib, 'getUserPlaylists').mockResolvedValueOnce({
      items: mockPlaylists,
      total: 2,
      limit: 50,
      offset: 0,
      href: '',
      next: null,
      previous: null,
    } as any);

    await act(async () => {
      render(<DiscoverPage />);
    });

    expect(screen.getByText('Corrupted Playlist')).toBeInTheDocument();
    expect(screen.getByText('Valid Playlist (15 tracks)')).toBeInTheDocument();
  });

  it('renders LandingHeroPreview and toggles between telemetry tabs', () => {
    render(<LandingHeroPreview />);

    // Default radar tab
    expect(screen.getByText('Multi-Dimensional DNA')).toBeInTheDocument();
    expect(screen.getByText('Dance (88%)')).toBeInTheDocument();

    // Switch to Player tab
    fireEvent.click(screen.getByRole('button', { name: 'Player' }));
    expect(screen.getByText('30s Streaming Audio Preview')).toBeInTheDocument();
    expect(screen.getByText('Solaris Pulse (Extended Mix)')).toBeInTheDocument();

    // Switch to Archetype tab
    fireEvent.click(screen.getByRole('button', { name: 'Archetype' }));
    expect(screen.getByText('High-Octane Party Catalyst')).toBeInTheDocument();
    expect(screen.getByText('Sonic Archetype Classification')).toBeInTheDocument();
  });

  it('renders LandingFaq and expands/collapses questions', () => {
    render(<LandingFaq />);

    // First FAQ is open by default
    expect(screen.getByText(/Sonalyze connects directly via official Spotify OAuth/i)).toBeInTheDocument();

    // Click on another FAQ
    const secondFaqBtn = screen.getByRole('button', { name: /Is my Spotify password or listening history stored on your servers\?/i });
    fireEvent.click(secondFaqBtn);
    expect(screen.getByText(/Sonalyze operates with a 100% stateless architecture/i)).toBeInTheDocument();

    // Collapse it
    fireEvent.click(secondFaqBtn);
    expect(screen.queryByText(/Sonalyze operates with a 100% stateless architecture/i)).not.toBeInTheDocument();
  });

  it('renders complete redesigned LandingPage structure', () => {
    render(<LandingPage />);

    // Check header & hero
    expect(screen.getAllByText('Sonalyze').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/See the shape of your sound/i);

    // Check feature sections
    expect(screen.getByRole('heading', { name: 'Top tracks & previews' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Audio DNA' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Taste profile' })).toBeInTheDocument();

    // Check Archetypes & Security
    expect(screen.getByText('High-Octane Party Catalyst')).toBeInTheDocument();
    expect(screen.getByText('100% Stateless Sessions')).toBeInTheDocument();
  });
});
