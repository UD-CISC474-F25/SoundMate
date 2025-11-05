import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';

@Controller('connections')
export class ConnectionsController {
    constructor(private readonly connectionsService: ConnectionsService) {}

    @Get()
    findAll() {
        return this.connectionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.connectionsService.findOne(id);
    }
}