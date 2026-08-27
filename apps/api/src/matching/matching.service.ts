import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface UserMusicData {
  topArtists: Array<{ artistId: string; rank: number; timeRange: string }>;
  topGenres: Array<{ genre: string; rank: number; timeRange: string }>;
  topSongs: Array<{ songId: string; rank: number; timeRange: string }>;
}

interface MatchDetails {
  sharedArtists: string[];
  sharedGenres: string[];
  sharedSongs: string[];
  artistSimilarity: number;
  genreSimilarity: number;
  songSimilarity: number;
  listeningPatternSimilarity: number;
}

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate compatibility score between two users
   * Returns a score from 0-100 based on music preferences
   */
  async calculateCompatibilityScore(
    userId1: string,
    userId2: string,
  ): Promise<{ score: number; details: MatchDetails }> {
    // Fetch music data for both users
    const [user1Data, user2Data] = await Promise.all([
      this.getUserMusicData(userId1),
      this.getUserMusicData(userId2),
    ]);

    // Calculate individual similarity scores
    const artistSimilarity = this.calculateArtistSimilarity(
      user1Data.topArtists,
      user2Data.topArtists,
    );
    const genreSimilarity = this.calculateGenreSimilarity(
      user1Data.topGenres,
      user2Data.topGenres,
    );
    const songSimilarity = this.calculateSongSimilarity(
      user1Data.topSongs,
      user2Data.topSongs,
    );
    const listeningPatternSimilarity = this.calculateListeningPatternSimilarity(
      user1Data,
      user2Data,
    );

    // Find shared items
    const sharedArtists = this.findSharedItems(
      user1Data.topArtists.map((a) => a.artistId),
      user2Data.topArtists.map((a) => a.artistId),
    );
    const sharedGenres = this.findSharedItems(
      user1Data.topGenres.map((g) => g.genre),
      user2Data.topGenres.map((g) => g.genre),
    );
    const sharedSongs = this.findSharedItems(
      user1Data.topSongs.map((s) => s.songId),
      user2Data.topSongs.map((s) => s.songId),
    );

    // Weighted combination (Artist: 40%, Genre: 30%, Song: 20%, Pattern: 10%)
    const totalScore =
      artistSimilarity * 0.4 +
      genreSimilarity * 0.3 +
      songSimilarity * 0.2 +
      listeningPatternSimilarity * 0.1;

    // Normalize to 0-100 scale
    const normalizedScore = Math.round(totalScore * 100);

    return {
      score: Math.max(0, Math.min(100, normalizedScore)),
      details: {
        sharedArtists,
        sharedGenres,
        sharedSongs,
        artistSimilarity,
        genreSimilarity,
        songSimilarity,
        listeningPatternSimilarity,
      },
    };
  }

  /**
   * Get all music data for a user
   */
  private async getUserMusicData(userId: string): Promise<UserMusicData> {
    const [topArtists, topGenres, topSongs] = await Promise.all([
      this.prisma.userTopArtist.findMany({
        where: { userId },
        select: { artistId: true, rank: true, timeRange: true },
        orderBy: { rank: 'asc' },
      }),
      this.prisma.userTopGenre.findMany({
        where: { userId },
        select: { genre: true, rank: true, timeRange: true },
        orderBy: { rank: 'asc' },
      }),
      this.prisma.userTopSong.findMany({
        where: { userId },
        select: { songId: true, rank: true, timeRange: true },
        orderBy: { rank: 'asc' },
      }),
    ]);

    return {
      topArtists: topArtists.map((a) => ({
        artistId: a.artistId,
        rank: a.rank,
        timeRange: a.timeRange,
      })),
      topGenres: topGenres.map((g) => ({
        genre: g.genre,
        rank: g.rank,
        timeRange: g.timeRange,
      })),
      topSongs: topSongs.map((s) => ({
        songId: s.songId,
        rank: s.rank,
        timeRange: s.timeRange,
      })),
    };
  }

  /**
   * Calculate artist similarity using weighted Jaccard index
   * Higher ranked artists have more weight
   */
  private calculateArtistSimilarity(
    artists1: Array<{ artistId: string; rank: number }>,
    artists2: Array<{ artistId: string; rank: number }>,
  ): number {
    if (artists1.length === 0 || artists2.length === 0) return 0;

    // Create weighted maps (higher rank = lower weight value = more important)
    const map1 = new Map(artists1.map((a) => [a.artistId, 1 / a.rank]));
    const map2 = new Map(artists2.map((a) => [a.artistId, 1 / a.rank]));

    let intersection = 0;
    let union = 0;

    // Calculate weighted intersection
    const allArtists = new Set([...map1.keys(), ...map2.keys()]);
    for (const artistId of allArtists) {
      const weight1 = map1.get(artistId) || 0;
      const weight2 = map2.get(artistId) || 0;
      intersection += Math.min(weight1, weight2);
      union += Math.max(weight1, weight2);
    }

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Calculate genre similarity using weighted overlap
   */
  private calculateGenreSimilarity(
    genres1: Array<{ genre: string; rank: number }>,
    genres2: Array<{ genre: string; rank: number }>,
  ): number {
    if (genres1.length === 0 || genres2.length === 0) return 0;

    const map1 = new Map(genres1.map((g) => [g.genre, 1 / g.rank]));
    const map2 = new Map(genres2.map((g) => [g.genre, 1 / g.rank]));

    let intersection = 0;
    let union = 0;

    const allGenres = new Set([...map1.keys(), ...map2.keys()]);
    for (const genre of allGenres) {
      const weight1 = map1.get(genre) || 0;
      const weight2 = map2.get(genre) || 0;
      intersection += Math.min(weight1, weight2);
      union += Math.max(weight1, weight2);
    }

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Calculate song similarity using weighted Jaccard index
   */
  private calculateSongSimilarity(
    songs1: Array<{ songId: string; rank: number }>,
    songs2: Array<{ songId: string; rank: number }>,
  ): number {
    if (songs1.length === 0 || songs2.length === 0) return 0;

    const map1 = new Map(songs1.map((s) => [s.songId, 1 / s.rank]));
    const map2 = new Map(songs2.map((s) => [s.songId, 1 / s.rank]));

    let intersection = 0;
    let union = 0;

    const allSongs = new Set([...map1.keys(), ...map2.keys()]);
    for (const songId of allSongs) {
      const weight1 = map1.get(songId) || 0;
      const weight2 = map2.get(songId) || 0;
      intersection += Math.min(weight1, weight2);
      union += Math.max(weight1, weight2);
    }

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Calculate listening pattern similarity
   * Compares the distribution of items across time ranges
   */
  private calculateListeningPatternSimilarity(
    user1Data: UserMusicData,
    user2Data: UserMusicData,
  ): number {
    const getTimeRangeDistribution = (data: UserMusicData) => {
      const total =
        data.topArtists.length + data.topGenres.length + data.topSongs.length;
      if (total === 0) return { SHORT_TERM: 0, MEDIUM_TERM: 0, LONG_TERM: 0 };

      const counts = { SHORT_TERM: 0, MEDIUM_TERM: 0, LONG_TERM: 0 };

      [...data.topArtists, ...data.topGenres, ...data.topSongs].forEach(
        (item) => {
          if (item.timeRange in counts) {
            counts[item.timeRange as keyof typeof counts]++;
          }
        },
      );

      return {
        SHORT_TERM: counts.SHORT_TERM / total,
        MEDIUM_TERM: counts.MEDIUM_TERM / total,
        LONG_TERM: counts.LONG_TERM / total,
      };
    };

    const dist1 = getTimeRangeDistribution(user1Data);
    const dist2 = getTimeRangeDistribution(user2Data);

    // Calculate cosine similarity between distributions
    const dotProduct =
      dist1.SHORT_TERM * dist2.SHORT_TERM +
      dist1.MEDIUM_TERM * dist2.MEDIUM_TERM +
      dist1.LONG_TERM * dist2.LONG_TERM;

    const magnitude1 = Math.sqrt(
      dist1.SHORT_TERM ** 2 + dist1.MEDIUM_TERM ** 2 + dist1.LONG_TERM ** 2,
    );
    const magnitude2 = Math.sqrt(
      dist2.SHORT_TERM ** 2 + dist2.MEDIUM_TERM ** 2 + dist2.LONG_TERM ** 2,
    );

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Find shared items between two arrays
   */
  private findSharedItems<T>(arr1: T[], arr2: T[]): T[] {
    const set2 = new Set(arr2);
    return arr1.filter((item) => set2.has(item));
  }

  /**
   * Get friend suggestions for a user
   * Returns users with highest compatibility scores
   * If no users meet the minScore threshold, returns all available users sorted by score
   */
  async getFriendSuggestions(
    userId: string,
    options: {
      limit?: number;
      minScore?: number;
      excludeConnections?: boolean;
    } = {},
  ): Promise<
    Array<{
      userId: string;
      compatibilityScore: number;
      sharedArtists: string[];
      sharedGenres: string[];
    }>
  > {
    const { limit = 20, minScore = 50, excludeConnections = true } = options;

    // Check if current user has Spotify stats
    const currentUserStats = await this.prisma.userSpotifyStats.findUnique({
      where: { userId },
    });

    console.log('[MatchingService] Current user has Spotify stats:', !!currentUserStats);

    // Get all potential matches (exclude self)
    // Only require isOnboarded, not Spotify stats (for better UX when users have no music data)
    let potentialUsers = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        isOnboarded: true,
      },
      select: { id: true },
      take: 100, // Limit initial fetch for performance
    });

    console.log('[MatchingService] Found potential users:', potentialUsers.length);

    // Exclude already connected users if requested
    if (excludeConnections) {
      const connections = await this.prisma.connection.findMany({
        where: {
          OR: [{ requesterId: userId }, { receiverId: userId }],
          status: 'ACCEPTED',
        },
        select: { requesterId: true, receiverId: true },
      });

      const connectedUserIds = new Set(
        connections.flatMap((c) => [c.requesterId, c.receiverId]),
      );
      connectedUserIds.delete(userId);

      potentialUsers = potentialUsers.filter(
        (u) => !connectedUserIds.has(u.id),
      );
    }

    // Calculate compatibility scores
    const suggestions = await Promise.all(
      potentialUsers.map(async (user) => {
        const result = await this.calculateCompatibilityScore(
          userId,
          user.id,
        );
        return {
          userId: user.id,
          compatibilityScore: result.score,
          sharedArtists: result.details.sharedArtists,
          sharedGenres: result.details.sharedGenres,
        };
      }),
    );

    // Sort by compatibility score (highest first)
    const sortedSuggestions = suggestions.sort(
      (a, b) => b.compatibilityScore - a.compatibilityScore,
    );

    // Filter by minimum score
    const filteredSuggestions = sortedSuggestions.filter(
      (s) => s.compatibilityScore >= minScore,
    );

    // If no users meet the minimum score, return all available users instead
    const finalSuggestions =
      filteredSuggestions.length > 0 ? filteredSuggestions : sortedSuggestions;

    console.log('[MatchingService] Returning suggestions:', finalSuggestions.length);
    console.log('[MatchingService] Top 3 scores:', finalSuggestions.slice(0, 3).map(s => s.compatibilityScore));

    return finalSuggestions.slice(0, limit);
  }
}
