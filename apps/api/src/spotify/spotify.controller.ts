import { Controller, Post, UseGuards, Query } from '@nestjs/common';
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

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async syncTopArtists(
    @CurrentUser() jwtUser: JwtUser,
    @Query('timeRange') timeRange?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id: jwtUser.sub },
      include: { spotifyStats: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.spotifyStats) {
      return {
        success: false,
        message: 'Spotify not connected. Please connect your Spotify account first.',
        requiresSpotifyAuth: true,
      };
    }

    const result = await this.spotifyService.syncTopArtists(
      user.id,
      timeRange || 'LONG_TERM',
    );

    return {
      success: true,
      ...result,
    };
  }
}
