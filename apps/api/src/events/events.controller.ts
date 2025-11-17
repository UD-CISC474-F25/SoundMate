import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { EventCreateIn, EventUpdateIn, EventRsvpIn } from '@repo/api';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { UsersService } from '../users/users.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.eventsService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.eventsService.findOne(id, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(EventCreateIn))
    body: any,
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.eventsService.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(EventUpdateIn))
    body: any,
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.eventsService.update(id, user.id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.eventsService.delete(id, user.id);
  }

  @Post(':id/rsvp')
  @UseGuards(JwtAuthGuard)
  async rsvp(
    @Param('id') id: string,
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(EventRsvpIn))
    body: { status: string },
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.eventsService.rsvp(id, user.id, body.status);
  }
}
