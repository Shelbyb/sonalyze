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
import { signIn, signOut } from 'next-auth/react';
import type { SpotifyTrack } from '@/types/spotify';

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
});
