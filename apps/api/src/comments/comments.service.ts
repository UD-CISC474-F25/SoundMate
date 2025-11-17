import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async addComment(eventId: string, userId: string, content: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

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

  async getComments(eventId: string) {
    return this.prisma.eventComment.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
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
