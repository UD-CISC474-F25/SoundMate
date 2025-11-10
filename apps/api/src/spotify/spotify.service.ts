import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpotifyService {
  constructor(private prisma: PrismaService) {}

  async syncTopArtists(
    userId: string,
    accessToken: string,
    refreshToken: string,
    timeRange: any = 'LONG_TERM',
  ) {
    const topArtists = await this.fetchTopArtists(accessToken, timeRange);

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
          userId_artistId: {
            userId,
            artistId: artist.id,
          },
        },
        update: {
          rank: index + 1,
          timeRange,
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
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
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

  async getProfile(accessToken: string) {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch Spotify profile');
    }

    return response.json();
  }
}
