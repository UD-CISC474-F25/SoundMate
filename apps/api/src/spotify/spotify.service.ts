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

  private async getValidAccessToken(userId: string): Promise<string> {
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

  async syncTopArtists(
    userId: string,
    timeRange: any = 'LONG_TERM',
  ) {
    const validToken = await this.getValidAccessToken(userId);

    const topArtists = await this.fetchTopArtists(validToken, timeRange);

    const artistPromises = topArtists.items.map(async (spotifyArtist: any, index: number) => {
      const artist = await this.prisma.artist.upsert({
        where: { spotifyArtistId: spotifyArtist.id },
        update: {
          name: spotifyArtist.name,
          genres: spotifyArtist.genres,
          imageUrl: spotifyArtist.images?.[0]?.url ?? null,
          spotifyUri: spotifyArtist.uri,
        },
        create: {
          spotifyArtistId: spotifyArtist.id,
          name: spotifyArtist.name,
          genres: spotifyArtist.genres,
          imageUrl: spotifyArtist.images?.[0]?.url ?? null,
          spotifyUri: spotifyArtist.uri,
        },
      });

      await this.prisma.userTopArtist.upsert({
        where: {
          userId_artistId_timeRange: {
            userId,
            artistId: artist.id,
            timeRange,
          },
        },
        update: {
          rank: index + 1,
        },
        create: {
          userId,
          artistId: artist.id,
          rank: index + 1,
          timeRange,
        },
      });

      return artist;
    });

    const artists = await Promise.all(artistPromises);

    await this.prisma.userSpotifyStats.update({
      where: { userId },
      data: {
        lastSyncedAt: new Date(),
      },
    });

    return {
      syncedArtists: artists.length,
      lastSyncedAt: new Date(),
      topArtists: artists.map((artist, index) => ({
        id: artist.id,
        spotifyArtistId: artist.spotifyArtistId,
        name: artist.name,
        genres: artist.genres,
        imageUrl: artist.imageUrl,
        rank: index + 1,
        timeRange,
      })),
    };
  }

  private async fetchTopArtists(accessToken: string, timeRange: any) {
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
      throw new BadRequestException('Failed to fetch top artists from Spotify');
    }

    return response.json();
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
