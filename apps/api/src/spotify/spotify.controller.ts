import { Controller, Post, Get, UseGuards, Query } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma.service';

@Controller('spotify')
export class SpotifyController {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Sync all Spotify data (artists, songs, genres) for the authenticated user.
   * Rate limited to only sync if last sync was more than 5 hours ago.
   * Can be forced with ?force=true query parameter.
   */
  @Post('sync-all')
  @UseGuards(JwtAuthGuard)
  async syncAll(
    @CurrentUser() jwtUser: JwtUser,
    @Query('force') force?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id: jwtUser.sub },
      include: { spotifyStats: true },
    });

    if (!user) throw new Error('User not found');

    if (!user.spotifyStats) {
      return {
        success: false,
        message: 'Spotify not connected. Please connect first.',
        requiresSpotifyAuth: true,
      };
    }

    // Check if we need to sync (rate limiting: 5 hours)
    const SYNC_INTERVAL_HOURS = 5;
    const now = new Date();
    const lastSync = user.spotifyStats.lastSyncedAt;
    const hoursSinceLastSync = lastSync
      ? (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
      : Infinity;

    const shouldSync = force === 'true' || hoursSinceLastSync >= SYNC_INTERVAL_HOURS;

    if (!shouldSync) {
      const hoursRemaining = Math.ceil(SYNC_INTERVAL_HOURS - hoursSinceLastSync);
      return {
        success: false,
        message: `Spotify data was synced recently. Please wait ${hoursRemaining} hour(s) before syncing again, or use ?force=true to force sync.`,
        lastSyncedAt: lastSync,
        nextSyncAvailable: new Date(lastSync!.getTime() + SYNC_INTERVAL_HOURS * 60 * 60 * 1000),
      };
    }

    const ranges = ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'];

    const artistResults: any[] = [];
    const songResults: any[] = [];

    for (const r of ranges) {
      artistResults.push(await this.spotifyService.syncTopArtists(user.id, r));
    }

    for (const r of ranges) {
      songResults.push(await this.spotifyService.syncTopSongs(user.id, r));
    }

    const genreResults: any[] = [];
    for (const r of ranges) {
      genreResults.push(await this.spotifyService.syncTopGenres(user.id, r));
    }

    return {
      success: true,
      message: 'Synced all Spotify data',
      artists: {
        shortTerm: artistResults[0],
        mediumTerm: artistResults[1],
        longTerm: artistResults[2],
      },
      songs: {
        shortTerm: songResults[0],
        mediumTerm: songResults[1],
        longTerm: songResults[2],
      },
      genres: {
        shortTerm: genreResults[0],
        mediumTerm: genreResults[1],
        longTerm: genreResults[2],
      },
      lastSyncedAt: now,
    };
  }
}
