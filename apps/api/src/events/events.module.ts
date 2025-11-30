import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { SpotifyModule } from '../spotify/spotify.module';

@Module({
  imports: [UsersModule, SpotifyModule],
  controllers: [EventsController],
  providers: [EventsService, PrismaService, UsersService],
})
export class EventsModule {}
