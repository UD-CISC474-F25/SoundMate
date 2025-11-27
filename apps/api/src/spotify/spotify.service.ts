import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);

  constructor(private prisma: PrismaService) {}

  private async refreshAccessToken(userId: string): Promise<string> {
    const userStats = await this.prisma.userSpotifyStats.findUnique({
      where: { userId },
      select: { refreshToken: true },
    });

    if (!userStats?.refreshToken) {
      throw new BadRequestException('No refresh token found. Please reconnect your Spotify account.');
    }

    this.logger.log(`Refreshing access token for user ${userId}`);

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: userStats.refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to refresh token: ${error}`);
      throw new BadRequestException('Failed to refresh Spotify token. Please reconnect your Spotify account.');
    }

    const tokens = await response.json();

    await this.prisma.userSpotifyStats.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token,
        tokenExpiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
        ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
      },
    });

    this.logger.log(`Successfully refreshed access token for user ${userId}`);
    return tokens.access_token;
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const userStats = await this.prisma.userSpotifyStats.findUnique({
      where: { userId },
      select: {
        accessToken: true,
        tokenExpiresAt: true,
        refreshToken: true,
      },
    });

    if (!userStats) {
      throw new BadRequestException('Spotify not connected. Please connect your Spotify account.');
    }

    const now = new Date();
    const expiryBuffer = new Date(now.getTime() + 5 * 60 * 1000);

    if (!userStats.tokenExpiresAt || userStats.tokenExpiresAt <= expiryBuffer) {
      this.logger.log(`Token expired or expiring soon for user ${userId}, refreshing...`);
      return await this.refreshAccessToken(userId);
    }

    return userStats.accessToken;
  }

  async syncTopArtists(userId: string, timeRange: any = 'LONG_TERM') {
    const accessToken = await this.getValidAccessToken(userId);

    const normalized: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM' =
      timeRange === 'SHORT_TERM' ||
      timeRange === 'MEDIUM_TERM' ||
      timeRange === 'LONG_TERM'
        ? timeRange
        : 'LONG_TERM';

    const topArtists = await this.fetchTopArtists(accessToken, normalized);

    for (let index = 0; index < topArtists.items.length; index++) {
      const artist = topArtists.items[index];

      const savedArtist = await this.prisma.artist.upsert({
        where: { spotifyArtistId: artist.id },
        update: {
          name: artist.name,
          genres: artist.genres,
          imageUrl: artist.images?.[0]?.url ?? null,
          spotifyUri: artist.uri,
        },
        create: {
          spotifyArtistId: artist.id,
          name: artist.name,
          genres: artist.genres,
          imageUrl: artist.images?.[0]?.url ?? null,
          spotifyUri: artist.uri,
        },
      });

      await this.prisma.userTopArtist.upsert({
        where: {
          userId_artistId_timeRange: {
            userId,
            artistId: savedArtist.id,
            timeRange: normalized,
          },
        },
        update: { rank: index + 1 },
        create: {
          userId,
          artistId: savedArtist.id,
          rank: index + 1,
          timeRange: normalized,
        },
      });
    }

    return { success: true };
  }

  async syncTopSongs(userId: string, timeRange: any = 'LONG_TERM') {
    const accessToken = await this.getValidAccessToken(userId);

    const topTracks = await this.fetchTopSongs(accessToken, timeRange);

    for (let index = 0; index < topTracks.items.length; index++) {
      const spotifyTrack = topTracks.items[index];

      const song = await this.prisma.song.upsert({
        where: { spotifySongId: spotifyTrack.id },
        update: {
          name: spotifyTrack.name,
          artists: spotifyTrack.artists.map((a: any) => a.name),
          albumImageUrl: spotifyTrack.album?.images?.[0]?.url ?? null,
          spotifyUri: spotifyTrack.uri,
        },
        create: {
          spotifySongId: spotifyTrack.id,
          name: spotifyTrack.name,
          artists: spotifyTrack.artists.map((a: any) => a.name),
          albumImageUrl: spotifyTrack.album?.images?.[0]?.url ?? null,
          spotifyUri: spotifyTrack.uri,
        },
      });

      await this.prisma.userTopSong.upsert({
        where: {
          userId_songId_timeRange: {
            userId,
            songId: song.id,
            timeRange,
          },
        },
        update: { rank: index + 1 },
        create: {
          userId,
          songId: song.id,
          rank: index + 1,
          timeRange,
        },
      });
    }

    const lastSyncedAt = new Date();
    await this.prisma.userSpotifyStats.update({
      where: { userId },
      data: { lastSyncedAt },
    });

    return {
      syncedSongs: topTracks.items.length,
      lastSyncedAt,
    };
  }

  async syncTopGenres(userId: string, timeRange: any = 'LONG_TERM') {
    const accessToken = await this.getValidAccessToken(userId);

    const normalized: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM' =
      timeRange === 'SHORT_TERM' ||
      timeRange === 'MEDIUM_TERM' ||
      timeRange === 'LONG_TERM'
        ? timeRange
        : 'LONG_TERM';

    const genres = await this.fetchTopGenres(accessToken, normalized);

    for (let index = 0; index < genres.length; index++) {
      const genre = genres[index];

      await this.prisma.userTopGenre.upsert({
        where: {
          userId_genre_timeRange: {
            userId,
            genre,
            timeRange: normalized,  
          },
        },
        update: { rank: index + 1 },
        create: {
          userId,
          genre,
          rank: index + 1,
          timeRange: normalized,
        },
      });
    }

    return { success: true };
  }

  async fetchTopArtists(accessToken: string, timeRange: any) {
    const timeRangeMap = {
      SHORT_TERM: 'short_term',
      MEDIUM_TERM: 'medium_term',
      LONG_TERM: 'long_term',
    };

    const response = await fetch(
      `https://api.spotify.com/v1/me/top/artists?time_range=${timeRangeMap[timeRange]}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const body = await response.text();          
      console.error("Spotify Top Artists Error:", {
      status: response.status,
      body,
      tokenStart: accessToken?.slice(0, 10),
    });
      throw new BadRequestException('Failed to fetch top artists from Spotify');
    }

    return response.json();
  }

  async fetchTopSongs(accessToken: string, timeRange: any) {
    const timeRangeMap = {
      SHORT_TERM: 'short_term',
      MEDIUM_TERM: 'medium_term',
      LONG_TERM: 'long_term',
    };

    const response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRangeMap[timeRange]}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch top songs from Spotify');
    }

    return response.json();
  }

  async fetchTopGenres(accessToken: string, timeRange: any) {
    const timeRangeMap = {
      SHORT_TERM: 'short_term',
      MEDIUM_TERM: 'medium_term',
      LONG_TERM: 'long_term',
    };

    const response = await fetch(
      `https://api.spotify.com/v1/me/top/artists?time_range=${timeRangeMap[timeRange]}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch genres from Spotify');
    }

    const data = await response.json();

    const genreCounts: Record<string, number> = {};

    for (const artist of data.items) {
      for (const genre of artist.genres ?? []) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    }

    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])  
      .map(([genre]) => genre);

    return sortedGenres;
  }

  async getTopArtistsFromDB(userId: string, timeRange: any = 'LONG_TERM', limit: number) {
    return this.prisma.userTopArtist.findMany({
      where: { userId, timeRange },
      orderBy: { rank: 'asc' }, 
      take: limit,
      include: {
        artist: true, 
      },
    });
  }

  async getTopSongsFromDB(userId: string, timeRange: any = 'LONG_TERM', limit: number) {
    return this.prisma.userTopSong.findMany({
      where: { userId, timeRange },
      orderBy: { rank: 'asc' },
      take: limit,
      include: {
        song: true,
      },
    });
  }

  async getTopGenresFromDB(userId: string, timeRange: any, limit: number) {
    return this.prisma.userTopGenre.findMany({
      where: { userId, timeRange },
      orderBy: { rank: 'asc' },
      take: limit,
    });
  }


  async getProfile(userId: string) {
    const validToken = await this.getValidAccessToken(userId);

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch Spotify profile');
    }

    return response.json();
  }
}
