import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLinkDto, UpdateLinkDto } from '@repo/api';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createLinkDto: CreateLinkDto) {
    if (createLinkDto.order === undefined) {
      const maxOrder = await this.prisma.link.findFirst({
        where: { userId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      createLinkDto.order = maxOrder ? maxOrder.order + 1 : 0;
    }

    return this.prisma.link.create({
      data: {
        userId,
        title: createLinkDto.title,
        url: createLinkDto.url,
        order: createLinkDto.order,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.link.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.link.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(id: string, userId: string, updateLinkDto: UpdateLinkDto) {
    // findOne is already scoped to `userId`, so this one check covers both
    // "doesn't exist" and "exists but belongs to someone else" without
    // revealing to the caller which case it was, same as every sibling
    // service (comments, connections, events) does for its own resources.
    const link = await this.findOne(id, userId);
    if (!link) {
      throw new NotFoundException('Link not found');
    }

    return this.prisma.link.update({
      where: { id },
      data: updateLinkDto,
    });
  }

  async remove(id: string, userId: string) {
    const link = await this.findOne(id, userId);
    if (!link) {
      throw new NotFoundException('Link not found');
    }

    return this.prisma.link.delete({
      where: { id },
    });
  }
}
