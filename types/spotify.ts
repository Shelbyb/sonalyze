export interface SpotifyImage {
  url: string;
  width?: number;
  height?: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres?: string[];
  images: SpotifyImage[];
  popularity?: number;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity?: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  explicit?: boolean;
}

export interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  tempo: number;
  loudness: number;
  key: number;
  mode: number;
  time_signature: number;
  duration_ms: number;
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: { total: number };
  owner: { display_name: string; id: string };
  external_urls: { spotify: string };
  public: boolean;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  images: SpotifyImage[];
  followers?: { total: number };
  external_urls: { spotify: string };
  product?: string;
  country?: string;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';
