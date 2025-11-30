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
    return this.prisma.connection.findMany({
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
