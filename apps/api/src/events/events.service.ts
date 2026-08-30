import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@repo/database';
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
      // A bounded default so this can't grow into an unbounded response as
      // events accumulate. This isn't full cursor pagination (the frontend
      // doesn't ask for pages yet), just a cap so "return every visible
      // event with every attendee joined in" can't scale linearly forever.
      // See ARCHITECTURE.md for the pagination follow-up.
      take: 100,
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
        _count: {
          select: { attendees: true, comments: true },
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
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Deliberately not `&& userId`: every current controller call resolves
    // a real user first, but if this service is ever called without one
    // (a future public/anonymous preview route, say), a private event
    // must still be denied rather than silently passing because `userId`
    // was falsy.
    if (event.visibility === 'PRIVATE') {
      const hasAccess =
        !!userId &&
        (event.creatorId === userId || event.attendees.some((a) => a.userId === userId));

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

    // A PRIVATE event previously had no gate here at all: anyone
    // authenticated could self-RSVP, which then satisfied findOne()'s own
    // "are you an attendee" access check, letting an uninvited user unlock
    // the event's full details just by RSVPing to it. Only the creator or
    // someone already invited (an existing EventAttendee row, any status)
    // may RSVP to a private event.
    if (event.visibility === 'PRIVATE' && event.creatorId !== userId) {
      const existingAttendee = await this.prisma.eventAttendee.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!existingAttendee) {
        throw new ForbiddenException(
          'You must be invited to RSVP to this private event',
        );
      }
    }

    try {
      // The capacity check and the write that adds a new GOING attendee
      // used to be two separate, non-atomic queries: read the count, then
      // upsert. Two concurrent RSVPs could both read the same count before
      // either commit, and both pass the check, over-filling a capped
      // event. Running both inside a SERIALIZABLE transaction makes
      // Postgres detect that conflict itself: if two overlapping
      // transactions would both succeed in a way that isn't actually safe
      // together, one of them fails with a serialization error instead of
      // silently letting the event go over capacity.
      return await this.prisma.$transaction(
        async (tx) => {
          const attendee = await tx.eventAttendee.upsert({
            where: { eventId_userId: { eventId, userId } },
            update: { status: status as any },
            create: { eventId, userId, status: status as any },
          });

          if (event.maxAttendees && status === 'GOING') {
            const currentAttendees = await tx.eventAttendee.count({
              where: { eventId, status: 'GOING', userId: { not: userId } },
            });

            if (currentAttendees >= event.maxAttendees) {
              throw new ForbiddenException('Event is full');
            }
          }

          return attendee;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error: any) {
      // Prisma surfaces a Postgres serialization failure (two concurrent
      // SERIALIZABLE transactions that conflicted) as error code P2034.
      if (error?.code === 'P2034') {
        throw new ForbiddenException('Event is full, please try again');
      }
      throw error;
    }
  }
}
