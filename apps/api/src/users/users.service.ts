import { Injectable, NotFoundException } from '@nestjs/common';
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

    if (!user.spotifyStats) {
      return {
        ...user,
        topArtists: [],
        topSongs: [],
        topGenres: [],
      };
    }

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

  async createUserFromAuth0(auth0Id: string) {
    return this.prisma.user.create({
      data: {
        auth0Id,
        isOnboarded: false,
      },
    });
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
    const connectionMap = new Map<string, { connectionId: string; status: string; isPendingFromThem: boolean }>();

    connections.forEach((conn) => {
      const otherUserId = conn.requesterId === currentUserId ? conn.receiverId : conn.requesterId;
      const isPendingFromThem = conn.receiverId === currentUserId && conn.status === 'PENDING';

      connectionMap.set(otherUserId, {
        connectionId: conn.id,
        status: conn.status,
        isPendingFromThem,
      });
    });

    // Return users with connection status information
    return users.map((user) => {
      const connectionInfo = connectionMap.get(user.id);

      return {
        ...user,
        compatibilityScore: undefined, // No score for search results
        connectionStatus: connectionInfo?.status || 'NONE',
        isPendingFromThem: connectionInfo?.isPendingFromThem || false,
        connectionId: connectionInfo?.connectionId || null,
      };
    });
  }
}
