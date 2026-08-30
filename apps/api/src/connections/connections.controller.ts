import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { UsersService } from '../users/users.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

import {
  ConnectionCreateIn,
  ConnectionUpdateIn,
} from '@repo/api';

import { ConnectionsService } from './connections.service';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(
    private readonly connectionsService: ConnectionsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getConnections(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.connectionsService.getConnectionsForUser(user.id);
  }

  @Post()
  async createConnection(
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(ConnectionCreateIn))
    body: { receiverId: string },
  ) {
    const requester = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.connectionsService.addConnection(
      requester.id,
      body.receiverId,
    );
  }

  @Patch(':connectionId')
  async updateConnection(
    @Param('connectionId') connectionId: string,
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(ConnectionUpdateIn))
    body: { status: 'PENDING' | 'ACCEPTED' },
  ) {
    const user = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.connectionsService.updateConnection(
      connectionId,
      user.id,
      body,
    );
  }

  @Delete(':connectionId')
  async deleteConnection(
    @Param('connectionId') connectionId: string,
    @CurrentUser() jwtUser: JwtUser,
  ) {
    const user = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.connectionsService.deleteConnection(connectionId, user.id);
  }
}
