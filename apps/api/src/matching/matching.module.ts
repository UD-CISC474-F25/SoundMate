import { Module } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { PrismaService } from '../prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MatchingController],
  providers: [MatchingService, PrismaService],
  exports: [MatchingService],
})
export class MatchingModule {}
