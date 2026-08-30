import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Comments live under an event, so they need the same access rule the
   * event itself enforces (EventsService.findOne): a PRIVATE event is only
   * visible to its creator and its attendees. Without this, anyone who
   * simply knows an event's id could read or post into a private event's
   * comment thread even though they can't view the event via GET /events/:id.
   */
  private async assertEventAccess(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { attendees: { select: { userId: true } } },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (event.visibility === 'PRIVATE') {
      const hasAccess =
        event.creatorId === userId ||
        event.attendees.some((a) => a.userId === userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this event');
      }
    }

    return event;
  }

  async addComment(eventId: string, userId: string, content: string) {
    await this.assertEventAccess(eventId, userId);

    return this.prisma.eventComment.create({
      data: {
        eventId,
        userId,
        content,
      },
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
    });
  }

  async getComments(eventId: string, userId: string) {
    await this.assertEventAccess(eventId, userId);

    return this.prisma.eventComment.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
      // Intentionally not selecting `auth0Id` here: it previously was,
      // which leaked every commenter's raw Auth0 subject id (an internal
      // identifier, not meant to be public) to any authenticated caller
      // who could see the thread.
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
      take: 200, // bounded default; see ARCHITECTURE.md for the pagination note
    });
  }

  async updateComment(commentId: string, userId: string, content: string) {
  const comment = await this.prisma.eventComment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  if (comment.userId !== userId) {
    throw new ForbiddenException('You can only edit your own comments');
  }

  const updated = await this.prisma.eventComment.update({
    where: { id: commentId },
    data: { content },
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
  });

  return updated;
}


  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.eventComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId !== userId)
      throw new ForbiddenException('You can only delete your own comments');

    await this.prisma.eventComment.delete({ where: { id: commentId } });

    return { message: 'Comment deleted successfully' };
  }
}
