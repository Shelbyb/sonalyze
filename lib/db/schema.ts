import { pgTable, text, jsonb, timestamp, serial, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  spotifyId: text('spotify_id').primaryKey(),
  name: text('name'),
  email: text('email'),
  image: text('image'),
  product: text('product'),
  country: text('country'),
  preferences: jsonb('preferences'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const listeningSnapshots = pgTable('listening_snapshots', {
  id: serial('id').primaryKey(),
  spotifyId: text('spotify_id')
    .notNull()
    .references(() => users.spotifyId, { onDelete: 'cascade' }),
  timeRange: text('time_range').notNull(),
  topTracks: jsonb('top_tracks').notNull(),
  topArtists: jsonb('top_artists').notNull(),
  capturedAt: timestamp('captured_at', { withTimezone: true }).defaultNow().notNull(),
});

export const trackTags = pgTable(
  'track_tags',
  {
    spotifyId: text('spotify_id')
      .notNull()
      .references(() => users.spotifyId, { onDelete: 'cascade' }),
    trackId: text('track_id').notNull(),
    tag: text('tag').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.spotifyId, t.trackId, t.tag] })],
);
