-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('INVITED', 'GOING', 'MAYBE', 'DECLINED');

-- CreateEnum
CREATE TYPE "TimeRange" AS ENUM ('SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "auth0_id" TEXT NOT NULL,
    "email" TEXT,
    "spotify_id" TEXT,
    "username" TEXT,
    "display_name" TEXT,
    "profile_photo_url" TEXT,
    "bio" TEXT,
    "spotify_profile_url" TEXT,
    "show_spotify_profile" BOOLEAN NOT NULL DEFAULT true,
    "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_spotify_stats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMP(3) NOT NULL,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_spotify_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" TEXT NOT NULL,
    "spotify_artist_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_url" TEXT,
    "spotify_uri" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_top_artists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "time_range" "TimeRange" NOT NULL DEFAULT 'LONG_TERM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_top_artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "compatibility_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist_id" TEXT,
    "description" TEXT,
    "date_time" TIMESTAMP(3),
    "location" TEXT,
    "music_tag" TEXT,
    "visibility" "EventVisibility" NOT NULL DEFAULT 'PRIVATE',
    "max_attendees" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "AttendeeStatus" NOT NULL DEFAULT 'INVITED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_comments" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth0_id_key" ON "users"("auth0_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_spotify_id_key" ON "users"("spotify_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_spotify_stats_user_id_key" ON "user_spotify_stats"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "artists_spotify_artist_id_key" ON "artists"("spotify_artist_id");

-- CreateIndex
CREATE INDEX "user_top_artists_user_id_rank_idx" ON "user_top_artists"("user_id", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "user_top_artists_user_id_artist_id_key" ON "user_top_artists"("user_id", "artist_id");

-- CreateIndex
CREATE INDEX "connections_receiver_id_status_idx" ON "connections"("receiver_id", "status");

-- CreateIndex
CREATE INDEX "connections_requester_id_status_idx" ON "connections"("requester_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "connections_requester_id_receiver_id_key" ON "connections"("requester_id", "receiver_id");

-- CreateIndex
CREATE INDEX "events_visibility_date_time_idx" ON "events"("visibility", "date_time");

-- CreateIndex
CREATE INDEX "events_creator_id_idx" ON "events"("creator_id");

-- CreateIndex
CREATE INDEX "event_attendees_user_id_status_idx" ON "event_attendees"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_event_id_user_id_key" ON "event_attendees"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "event_comments_event_id_created_at_idx" ON "event_comments"("event_id", "created_at");

-- CreateIndex
CREATE INDEX "event_comments_user_id_idx" ON "event_comments"("user_id");

-- AddForeignKey
ALTER TABLE "user_spotify_stats" ADD CONSTRAINT "user_spotify_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_top_artists" ADD CONSTRAINT "user_top_artists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_top_artists" ADD CONSTRAINT "user_top_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comments" ADD CONSTRAINT "event_comments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comments" ADD CONSTRAINT "event_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
