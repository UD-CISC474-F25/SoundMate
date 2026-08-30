import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SpotifyService } from '../spotify/spotify.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private spotifyService: SpotifyService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePhotoUrl: true,
        bio: true,
        spotifyProfileUrl: true,
        showSpotifyProfile: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePhotoUrl: true,
        bio: true,
        spotifyProfileUrl: true,
        showSpotifyProfile: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneWithTopStats(userId: string, timeRange: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        topArtists: {
          where: { timeRange },
          include: { artist: true },
          orderBy: { rank: 'asc' },
        },
        topSongs: {
          where: { timeRange },
          include: { song: true },
          orderBy: { rank: 'asc' },
        },
        spotifyStats: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Note: we intentionally don't gate this on `user.spotifyStats` existing.
    // Users who build a taste profile manually (no Spotify connection) still
    // have real rows in userTopArtist/userTopGenre, and should see them here.
    const topArtists = user.topArtists.map((uta) => ({
      id: uta.artist.id,
      spotifyArtistId: uta.artist.spotifyArtistId,
      name: uta.artist.name,
      genres: uta.artist.genres,
      imageUrl: uta.artist.imageUrl,
      spotifyUri: uta.artist.spotifyUri,
      rank: uta.rank,
      timeRange: uta.timeRange,
    }));

    const topSongs = user.topSongs.map((uts) => ({
      id: uts.song.id,
      spotifySongId: uts.song.spotifySongId,
      name: uts.song.name,
      artists: uts.song.artists,
      albumImage: uts.song.albumImageUrl,
      spotifyUri: uts.song.spotifyUri,
      rank: uts.rank,
      timeRange: uts.timeRange,
    }));

    const topGenres = await this.spotifyService.getTopGenresFromDB(
      userId,
      timeRange,
      8
    );

    return {
      ...user,
      topArtists,
      topSongs,
      topGenres: topGenres.map((g) => g.genre),
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        spotifyId: true,
        username: true,
        displayName: true,
        profilePhotoUrl: true,
        bio: true,
        spotifyProfileUrl: true,
        showSpotifyProfile: true,
        isOnboarded: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        spotifyStats: {
          select: {
            lastSyncedAt: true,
          },
        },
        // Cheap existence check so the frontend can gate the matching
        // feature without fetching the full profile (works for both
        // Spotify-synced and manually-built taste profiles).
        _count: {
          select: {
            topArtists: true,
            topGenres: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateCurrentUser(
    userId: string,
    data: {
      displayName?: string;
      bio?: string | null;
      showSpotifyProfile?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async findByAuth0Id(auth0Id: string) {
    return this.prisma.user.findUnique({
      where: { auth0Id },
    });
  }

  /**
   * Every controller that guards a route with JwtAuthGuard then needs the
   * User row for the verified auth0Id, and there's no separate "register"
   * step, a verified JWT for an auth0Id we've never seen just gets a bare
   * user row created on the spot (see `getMe` in UsersController for the
   * original version of this pattern). Centralizing it here means every
   * controller gets a guaranteed non-null User back, instead of each one
   * separately doing `findByAuth0Id` and either forgetting to null-check it
   * (a 500 for any brand-new user) or duplicating the same four lines.
   */
  async findOrCreateByAuth0Id(auth0Id: string) {
    const existing = await this.findByAuth0Id(auth0Id);
    if (existing) return existing;
    return this.createUserFromAuth0(auth0Id);
  }

  async createUserFromAuth0(auth0Id: string) {
    return this.prisma.user.create({
      data: {
        auth0Id,
        isOnboarded: false,
      },
    });
  }

  /**
   * Lets a user who hasn't connected Spotify (e.g. a portfolio/demo visitor
   * who couldn't get past Spotify's dev-mode allowlist) hand-pick their top
   * artists and genres instead. These are written into the same
   * userTopArtist/userTopGenre tables Spotify sync uses, so the existing
   * matching algorithm works identically for manual and synced profiles.
   *
   * Replaces any previously-submitted manual profile. Refuses to run for a
   * user with a real Spotify connection so it can never clobber synced data.
   */
  async setManualTasteProfile(
    userId: string,
    data: { artists: Array<string>; genres: Array<string> },
  ) {
    const existingStats = await this.prisma.userSpotifyStats.findUnique({
      where: { userId },
    });

    if (existingStats) {
      throw new BadRequestException(
        'This account already has Spotify connected — sync your Spotify data instead of setting a manual taste profile.',
      );
    }

    const timeRanges = ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'] as const;

    // Dedupe while preserving the order the user ranked them in.
    const artistNames = [...new Set(data.artists.map((a) => a.trim()).filter(Boolean))];
    const genreNames = [...new Set(data.genres.map((g) => g.trim().toLowerCase()).filter(Boolean))];

    await this.prisma.$transaction(async (tx) => {
      // Clear out any previous manual submission so re-submitting acts as
      // a full replace rather than an accumulation of stale entries.
      await tx.userTopArtist.deleteMany({ where: { userId } });
      await tx.userTopGenre.deleteMany({ where: { userId } });

      // Resolve each artist name to an Artist row, reusing an existing one
      // (case-insensitive) if it already exists — including artists that
      // came from another user's real Spotify sync — so manually-built
      // profiles can still match against real Spotify listeners.
      const artistIds: string[] = [];
      for (const name of artistNames) {
        let artist = await tx.artist.findFirst({
          where: { name: { equals: name, mode: 'insensitive' } },
        });

        if (!artist) {
          const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          artist = await tx.artist.create({
            data: {
              spotifyArtistId: `manual:${slug || 'artist'}:${userId}`,
              name,
              genres: [],
            },
          });
        }

        artistIds.push(artist.id);
      }

      for (const timeRange of timeRanges) {
        await tx.userTopArtist.createMany({
          data: artistIds.map((artistId, index) => ({
            userId,
            artistId,
            rank: index + 1,
            timeRange,
          })),
        });

        await tx.userTopGenre.createMany({
          data: genreNames.map((genre, index) => ({
            userId,
            genre,
            rank: index + 1,
            timeRange,
          })),
        });
      }
    });

    return this.findOneWithTopStats(userId, 'SHORT_TERM');
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

     if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prisma will handle cascade deletes for related data (topArtists, events, etc.)

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { success: true, message: 'User account deleted successfully' };
  }

  //Discovery Method
  async findUsersForDiscovery(currentUserId: string, search?: string) {
    const whereClause: any = {
      id: { not: currentUserId },
      isOnboarded: true,
    };

    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePhotoUrl: true,
        bio: true,
        topArtists: {
          take: 5,
          orderBy: { rank: 'asc' },
          include: {
            artist: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all connections for the current user to determine connection status
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
      select: {
        id: true,
        requesterId: true,
        receiverId: true,
        status: true,
      },
    });

    // Create a map of userId -> connection info for quick lookup
    const connectionMap = new Map<string, { connectionId: string; status: string; isRequester: boolean }>();
    for (const conn of connections) {
      const otherUserId = conn.requesterId === currentUserId ? conn.receiverId : conn.requesterId;
      connectionMap.set(otherUserId, {
        connectionId: conn.id,
        status: conn.status,
        isRequester: conn.requesterId === currentUserId,
      });
    }

    // Return users with connection status included
    const result = users.map((user) => {
      const connection = connectionMap.get(user.id);

      if (!connection) {
        // No connection exists
        return {
          ...user,
          compatibilityScore: undefined,
          connectionStatus: 'NONE',
          isPendingFromThem: false,
          connectionId: null,
        };
      }

      // Determine connection status
      let connectionStatus: 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED';
      let isPendingFromThem = false;

      if (connection.status === 'PENDING') {
        if (connection.isRequester) {
          // Current user sent the request
          connectionStatus = 'PENDING_SENT';
          isPendingFromThem = false;
        } else {
          // Current user received the request
          connectionStatus = 'PENDING_RECEIVED';
          isPendingFromThem = true;
        }
      } else {
        // status === 'ACCEPTED'
        connectionStatus = 'ACCEPTED';
        isPendingFromThem = false;
      }

      return {
        ...user,
        compatibilityScore: undefined,
        connectionStatus,
        isPendingFromThem,
        connectionId: connection.connectionId,
      };
    });

    return result;
  }
}
