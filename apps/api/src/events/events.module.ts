import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, PrismaService, UsersService],
})
export class EventsModule {}
