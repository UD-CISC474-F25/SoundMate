-- CreateTable
CREATE TABLE "songs" (
    "id" TEXT NOT NULL,
    "spotify_song_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "album_image_url" TEXT,
    "spotify_uri" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_top_songs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "song_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "time_range" "TimeRange" NOT NULL DEFAULT 'SHORT_TERM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_top_songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "songs_spotify_song_id_key" ON "songs"("spotify_song_id");

-- CreateIndex
CREATE INDEX "user_top_songs_user_id_time_range_rank_idx" ON "user_top_songs"("user_id", "time_range", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "user_top_songs_user_id_song_id_time_range_key" ON "user_top_songs"("user_id", "song_id", "time_range");

-- CreateIndex
CREATE INDEX "links_user_id_order_idx" ON "links"("user_id", "order");

-- AddForeignKey
ALTER TABLE "user_top_songs" ADD CONSTRAINT "user_top_songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_top_songs" ADD CONSTRAINT "user_top_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
