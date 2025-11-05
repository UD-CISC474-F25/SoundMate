import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ConnectionsController],
  providers: [ConnectionsService, PrismaService],
})
export class ConnectionsModule {}
