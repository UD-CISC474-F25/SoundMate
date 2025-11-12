import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    const where: any = {};

    if (userId) {
      where.OR = [
        { visibility: 'PUBLIC' },
        { creatorId: userId },
        { attendees: { some: { userId } } },
      ];
    } else {
      where.visibility = 'PUBLIC';
    }

    return this.prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
        artist: true,
        _count: {
          select: { attendees: true },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  async findOne(id: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
        artist: true,
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.visibility === 'PRIVATE' && userId) {
      const hasAccess =
        event.creatorId === userId || event.attendees.some((a) => a.userId === userId);

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this event');
      }
    }

    return event;
  }

  async create(
    userId: string,
    data: {
      title: string;
      description?: string | null;
      dateTime?: string | null;
      location?: string | null;
      musicTag?: string | null;
      artistId?: string | null;
      visibility?: 'PUBLIC' | 'PRIVATE';
      maxAttendees?: number | null;
    },
  ) {
    return this.prisma.event.create({
      data: {
        ...data,
        dateTime: data.dateTime ? new Date(data.dateTime) : null,
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
        artist: true,
      },
    });
  }

  async update(
    eventId: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      dateTime?: string | null;
      location?: string | null;
      musicTag?: string | null;
      artistId?: string | null;
      visibility?: 'PUBLIC' | 'PRIVATE';
      maxAttendees?: number | null;
    },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...data,
        dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePhotoUrl: true,
          },
        },
        artist: true,
      },
    });
  }

  async delete(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    return { message: 'Event deleted successfully' };
  }

  async rsvp(eventId: string, userId: string, status: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.maxAttendees && status === 'GOING') {
      const currentAttendees = await this.prisma.eventAttendee.count({
        where: {
          eventId,
          status: 'GOING',
        },
      });

      if (currentAttendees >= event.maxAttendees) {
        throw new ForbiddenException('Event is full');
      }
    }

    return this.prisma.eventAttendee.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      update: {
        status: status as any,
      },
      create: {
        eventId,
        userId,
        status: status as any,
      },
    });
  }
}
