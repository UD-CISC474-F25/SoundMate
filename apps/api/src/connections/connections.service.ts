import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConnectionStatusEnum } from '@repo/api';
import { ConnectionUpdateIn } from '@repo/api'; 

@Injectable()
export class ConnectionsService {
  constructor(private prisma: PrismaService) {}

  async addConnection(requesterId: string, receiverId: string) {
    if (requesterId === receiverId) {
      throw new BadRequestException('You cannot connect with yourself');
    }

    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      // Provide specific error messages based on connection status and direction
      if (existing.status === 'PENDING') {
        if (existing.requesterId === requesterId) {
          throw new BadRequestException('Already sent friend request');
        } else {
          throw new BadRequestException('This user already sent you a friend request. Check your pending requests.');
        }
      } else if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Already friends with this user');
      }
      throw new BadRequestException('Connection already exists');
    }

    return this.prisma.connection.create({
      data: {
        requesterId,
        receiverId,
        status: ConnectionStatusEnum.enum.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
      },
    });
  }

  async getConnectionsForUser(userId: string) {
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    // Fetch shared artists for each connection
    const connectionsWithSharedArtists = await Promise.all(
      connections.map(async (conn) => {
        const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;

        // Find shared artists between current user and the other user
        const [currentUserArtists, otherUserArtists] = await Promise.all([
          this.prisma.userTopArtist.findMany({
            where: { userId },
            include: { artist: true },
            orderBy: { rank: 'asc' },
            take: 20,
          }),
          this.prisma.userTopArtist.findMany({
            where: { userId: otherUserId },
            include: { artist: true },
            orderBy: { rank: 'asc' },
            take: 20,
          }),
        ]);

        // Find artists that appear in both lists
        const otherUserArtistIds = new Set(otherUserArtists.map(ua => ua.artistId));
        const sharedArtists = currentUserArtists
          .filter(ua => otherUserArtistIds.has(ua.artistId))
          .slice(0, 5) // Limit to 5 shared artists
          .map(ua => ({
            id: ua.artist.id,
            name: ua.artist.name,
            imageUrl: ua.artist.imageUrl,
          }));

        return {
          ...conn,
          sharedArtists,
        };
      })
    );

    return connectionsWithSharedArtists;
  }

  async updateConnection(
    connectionId: string,
    userId: string,
    data: ConnectionUpdateIn
  ) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.receiverId !== userId) {
      throw new ForbiddenException(
        'Only the receiver can update the connection'
      );
    }

    const status = data.status;

    return this.prisma.connection.update({
      where: { id: connectionId },
      data: { status },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
      },
    });
  }

  async deleteConnection(connectionId: string, userId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.requesterId !== userId && connection.receiverId !== userId) {
      throw new ForbiddenException('You cannot delete this connection');
    }

    await this.prisma.connection.delete({
      where: { id: connectionId },
    });

    return { message: 'Connection removed successfully' };
  }
}
