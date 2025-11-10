import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SpotifyController],
  providers: [SpotifyService, PrismaService],
  exports: [SpotifyService],
})
export class SpotifyModule {}
