import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { UsersService } from '../users/users.service';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * GET /matching/suggestions
   * Get friend suggestions based on music compatibility
   * Query params:
   *  - limit: max number of suggestions (default: 20)
   *  - minScore: minimum compatibility score (default: 50)
   *  - excludeConnections: exclude already connected users (default: true)
   */
  @Get('suggestions')
  async getSuggestions(
    @CurrentUser() jwtUser: JwtUser,
    @Query('limit') limit?: string,
    @Query('minScore') minScore?: string,
    @Query('excludeConnections') excludeConnections?: string,
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);

    const suggestions = await this.matchingService.getFriendSuggestions(
      user.id,
      {
        limit: limit ? parseInt(limit, 10) : 20,
        minScore: minScore ? parseInt(minScore, 10) : 50,
        excludeConnections: excludeConnections === 'false' ? false : true,
      },
    );

    // Get all connections for the current user to check status
    const connections = await this.usersService['prisma'].connection.findMany({
      where: {
        OR: [
          { requesterId: user.id },
          { receiverId: user.id },
        ],
      },
    });

    // Enrich suggestions with full user data and connection status
    const enrichedSuggestions = await Promise.all(
      suggestions.map(async (suggestion) => {
        const suggestedUser = await this.usersService.findOne(
          suggestion.userId,
        );

        // Check connection status
        const connection = connections.find(
          (conn) =>
            (conn.requesterId === user.id &&
              conn.receiverId === suggestion.userId) ||
            (conn.receiverId === user.id &&
              conn.requesterId === suggestion.userId),
        );

        let connectionStatus = 'NONE';
        let isPendingFromThem = false;
        let connectionId = null;

        if (connection) {
          connectionId = connection.id;

          if (connection.status === 'ACCEPTED') {
            connectionStatus = 'ACCEPTED';
          } else if (connection.status === 'PENDING') {
            connectionStatus = 'PENDING';
            isPendingFromThem = connection.receiverId === user.id;
          }
        }

        // Get artist and genre details
        const [artistDetails, genreNames] = await Promise.all([
          this.getArtistDetails(suggestion.sharedArtists),
          Promise.resolve(suggestion.sharedGenres),
        ]);

        return {
          user: {
            ...suggestedUser,
            connectionStatus,
            isPendingFromThem,
            connectionId,
          },
          compatibilityScore: suggestion.compatibilityScore,
          sharedArtists: artistDetails,
          sharedGenres: genreNames,
        };
      }),
    );

    return enrichedSuggestions;
  }

  /**
   * Helper to get artist details from artist IDs
   */
  private async getArtistDetails(artistIds: string[]) {
    if (artistIds.length === 0) return [];

    const artists = await Promise.all(
      artistIds.map(async (artistId) => {
        const artist = await this.usersService['prisma'].artist.findUnique({
          where: { id: artistId },
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        });
        return artist;
      }),
    );

    return artists.filter((a) => a !== null);
  }
}
