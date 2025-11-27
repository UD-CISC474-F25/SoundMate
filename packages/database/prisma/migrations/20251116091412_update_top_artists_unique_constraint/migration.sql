/*
  Warnings:

  - A unique constraint covering the columns `[user_id,artist_id,time_range]` on the table `user_top_artists` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."user_top_artists_user_id_artist_id_key";

-- DropIndex
DROP INDEX "public"."user_top_artists_user_id_rank_idx";

-- AlterTable
ALTER TABLE "user_top_artists" ALTER COLUMN "time_range" SET DEFAULT 'SHORT_TERM';

-- CreateIndex
CREATE INDEX "user_top_artists_user_id_time_range_rank_idx" ON "user_top_artists"("user_id", "time_range", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "user_top_artists_user_id_artist_id_time_range_key" ON "user_top_artists"("user_id", "artist_id", "time_range");