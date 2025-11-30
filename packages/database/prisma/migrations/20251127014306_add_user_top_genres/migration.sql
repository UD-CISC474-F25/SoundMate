-- CreateTable
CREATE TABLE "UserTopGenre" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "UserTopGenre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTopGenre_userId_genre_timeRange_key" ON "UserTopGenre"("userId", "genre", "timeRange");

-- AddForeignKey
ALTER TABLE "UserTopGenre" ADD CONSTRAINT "UserTopGenre_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
