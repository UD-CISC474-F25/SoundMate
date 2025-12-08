import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { PrismaService } from '../prisma.service';
import { UsersModule } from '../users/users.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [UsersModule, MatchingModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService, PrismaService],
})
export class ConnectionsModule {}
