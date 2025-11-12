import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
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
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.eventsService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.eventsService.findOne(id, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(EventCreateIn))
  async create(
    @CurrentUser() jwtUser: JwtUser,
    @Body()
    body: {
      title: string;
      description?: string | null;
      dateTime?: string | null;
      location?: string | null;
      musicTag?: string | null;
      artistId?: string | null;
      visibility?: 'PUBLIC' | 'PRIVATE';
      maxAttendees?: number | null;
    },
  ) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.eventsService.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(EventUpdateIn))
  async update(
    @Param('id') id: string,
    @CurrentUser() jwtUser: JwtUser,
    @Body()
    body: {
      title?: string;
      description?: string | null;
      dateTime?: string | null;
      location?: string | null;
      musicTag?: string | null;
      artistId?: string | null;
      visibility?: 'PUBLIC' | 'PRIVATE';
      maxAttendees?: number | null;
    },
  ) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.eventsService.update(id, user.id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.eventsService.delete(id, user.id);
  }

  @Post(':id/rsvp')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(EventRsvpIn))
  async rsvp(
    @Param('id') id: string,
    @CurrentUser() jwtUser: JwtUser,
    @Body() body: { status: string },
  ) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.eventsService.rsvp(id, user.id, body.status);
  }
}
