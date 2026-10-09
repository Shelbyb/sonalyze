import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrackRow from '@/components/TrackRow';
import ArtistCard from '@/components/ArtistCard';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import TimeRangeTabs from '@/components/TimeRangeTabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/StateViews';
import EqBars from '@/components/EqBars';
import Sidebar from '@/components/Sidebar';
import GlobalPlayer from '@/components/GlobalPlayer';
import { AudioPlayerProvider, useAudioPlayer } from '@/components/AudioPlayerContext';
import { Sparkles } from 'lucide-react';
import type { SpotifyTrack, SpotifyArtist } from '@/types/spotify';

const mockTrack: SpotifyTrack = {
  id: 'track-123',
  name: 'Paranoid Android',
  artists: [{ id: 'artist-1', name: 'Radiohead' }],
  album: {
    id: 'album-1',
    name: 'OK Computer',
    images: [{ url: 'https://example.com/okcomputer.jpg' }],
  },
  duration_ms: 383000,
  popularity: 85,
  preview_url: 'https://p.scdn.co/mp3-preview/test.mp3',
  external_urls: { spotify: 'https://open.spotify.com/track/track-123' },
  explicit: true,
};

const mockArtist: SpotifyArtist = {
  id: 'artist-1',
  name: 'Radiohead',
  genres: ['art rock', 'alternative rock'],
  images: [{ url: 'https://example.com/radiohead.jpg' }],
  popularity: 90,
  external_urls: { spotify: 'https://open.spotify.com/artist/artist-1' },
};

describe('Component Library Tests', () => {
  it('renders TrackRow with track metadata, duration, explicit badge, and preview actions', async () => {
    await act(async () => {
      render(
        <AudioPlayerProvider>
          <TrackRow track={mockTrack} rank={1} meta="Recently Played" />
        </AudioPlayerProvider>
      );
    });

    expect(screen.getByText('Paranoid Android')).toBeInTheDocument();
    expect(screen.getByText(/Radiohead/)).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('6:23')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    const playBtn = screen.getByLabelText(/Play preview of Paranoid Android/i);
    expect(playBtn).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(playBtn);
    });
  });

  it('renders ArtistCard with ranking, genres, and external link', () => {
    render(<ArtistCard artist={mockArtist} rank={1} />);

    expect(screen.getByText('Radiohead')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText(/art rock/i)).toBeInTheDocument();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://open.spotify.com/artist/artist-1');
  });

  it('renders StatCard with title, value, badge, and subtitle', () => {
    render(
      <StatCard
        title="Dominant Genre"
        value="Electronic"
        subtitle="65% of listening"
        icon={Sparkles}
        badge="Top Style"
      />
    );

    expect(screen.getByText('Dominant Genre')).toBeInTheDocument();
    expect(screen.getByText('Electronic')).toBeInTheDocument();
    expect(screen.getByText('65% of listening')).toBeInTheDocument();
    expect(screen.getByText('Top Style')).toBeInTheDocument();
  });

  it('renders PageHeader with eyebrow, title, description, and action slot', () => {
    render(
      <PageHeader
        eyebrow="Intelligence"
        title="Taste Profile"
        description="Exploration of your sonic preferences."
        action={<button>Export</button>}
      />
    );

    expect(screen.getByText('Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Taste Profile')).toBeInTheDocument();
    expect(screen.getByText('Exploration of your sonic preferences.')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders TimeRangeTabs and triggers onChange callbacks', () => {
    const handleChange = vi.fn();
    render(<TimeRangeTabs value="medium_term" onChange={handleChange} />);

    expect(screen.getByText('Last 4 weeks')).toBeInTheDocument();
    expect(screen.getByText('Last 6 months')).toBeInTheDocument();
    expect(screen.getByText('All time')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Last 4 weeks'));
    expect(handleChange).toHaveBeenCalledWith('short_term');

    fireEvent.click(screen.getByText('All time'));
    expect(handleChange).toHaveBeenCalledWith('long_term');
  });

  it('renders LoadingState, ErrorState, and EmptyState views', () => {
    const { rerender } = render(<LoadingState label="Analyzing audio profile" />);
    expect(screen.getByText(/Analyzing audio profile/)).toBeInTheDocument();

    rerender(<ErrorState message="API rate limit encountered" hint="Try again in 30s" />);
    expect(screen.getByText('API rate limit encountered')).toBeInTheDocument();
    expect(screen.getByText('Try again in 30s')).toBeInTheDocument();

    rerender(<EmptyState title="No playlists found" body="Create a playlist on Spotify first" />);
    expect(screen.getByText('No playlists found')).toBeInTheDocument();
    expect(screen.getByText('Create a playlist on Spotify first')).toBeInTheDocument();
  });

  it('renders EqBars animated visualizer', () => {
    const { container } = render(<EqBars className="text-accent" />);
    expect(container.querySelector('.eq-bars')).toBeInTheDocument();
  });

  it('renders Sidebar with brand name Sonalyze and navigation links', () => {
    render(<Sidebar userName="Alex" userImage="https://example.com/avatar.jpg" />);

    expect(screen.getByText('Sonalyze')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Top tracks')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
  });

  it('controls audio preview playback via GlobalPlayer and AudioPlayerContext', async () => {
    function PlayerTestConsumer() {
      const { playTrack, currentTrack } = useAudioPlayer();
      return (
        <div>
          <button onClick={() => playTrack(mockTrack)}>Load Track</button>
          <span data-testid="active-title">{currentTrack?.name}</span>
        </div>
      );
    }

    await act(async () => {
      render(
        <AudioPlayerProvider>
          <PlayerTestConsumer />
          <GlobalPlayer />
        </AudioPlayerProvider>
      );
    });

    expect(screen.queryByTestId('global-audio-player')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Load Track'));
    });

    expect(screen.getByTestId('active-title')).toHaveTextContent('Paranoid Android');
    expect(screen.getByTestId('global-audio-player')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /(play|pause) preview/i });
    expect(toggleBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    const closeBtn = screen.getByLabelText(/Close player/i);
    await act(async () => {
      fireEvent.click(closeBtn);
    });
    expect(screen.queryByTestId('global-audio-player')).not.toBeInTheDocument();
  });
});
