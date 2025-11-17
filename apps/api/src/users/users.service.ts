import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  async findOneWithTopArtists(id: string, timeRange?: any) {
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
        topArtists: {
          where: timeRange ? { timeRange } : {},
          include: {
            artist: true,
          },
          orderBy: {
            rank: 'asc',
          },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const topArtists = user.topArtists.map((ta) => ({
      id: ta.artist.id,
      spotifyArtistId: ta.artist.spotifyArtistId,
      name: ta.artist.name,
      genres: ta.artist.genres,
      imageUrl: ta.artist.imageUrl,
      spotifyUri: ta.artist.spotifyUri,
      rank: ta.rank,
      timeRange: ta.timeRange,
    }));

    return {
      ...user,
      topArtists,
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
}