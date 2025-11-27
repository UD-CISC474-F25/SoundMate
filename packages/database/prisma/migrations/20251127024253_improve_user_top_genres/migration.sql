/*
  Warnings:

  - You are about to drop the `UserTopGenre` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserTopGenre" DROP CONSTRAINT "UserTopGenre_userId_fkey";

-- DropTable
DROP TABLE "public"."UserTopGenre";

-- CreateTable
CREATE TABLE "user_top_genres" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "user_top_genres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_top_genres_userId_timeRange_rank_idx" ON "user_top_genres"("userId", "timeRange", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "user_top_genres_userId_genre_timeRange_key" ON "user_top_genres"("userId", "genre", "timeRange");

-- AddForeignKey
ALTER TABLE "user_top_genres" ADD CONSTRAINT "user_top_genres_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
