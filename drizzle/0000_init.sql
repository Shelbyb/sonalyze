CREATE TABLE IF NOT EXISTS "users" (
  "spotify_id" text PRIMARY KEY NOT NULL,
  "name" text,
  "email" text,
  "image" text,
  "product" text,
  "country" text,
  "preferences" jsonb,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "listening_snapshots" (
  "id" serial PRIMARY KEY NOT NULL,
  "spotify_id" text NOT NULL REFERENCES "users"("spotify_id") ON DELETE CASCADE,
  "time_range" text NOT NULL,
  "top_tracks" jsonb NOT NULL,
  "top_artists" jsonb NOT NULL,
  "captured_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "listening_snapshots_user_idx" ON "listening_snapshots" ("spotify_id", "captured_at");

CREATE TABLE IF NOT EXISTS "track_tags" (
  "spotify_id" text NOT NULL REFERENCES "users"("spotify_id") ON DELETE CASCADE,
  "track_id" text NOT NULL,
  "tag" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("spotify_id", "track_id", "tag")
);
