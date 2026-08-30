import {
  Controller, Delete, Get, Patch, Post, Param, Body, Query, UseGuards, NotFoundException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { UserUpdateIn, TasteProfileIn } from '@repo/api';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.usersService.getCurrentUser(user.id);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  async getMeProfile(
    @CurrentUser() jwtUser: JwtUser,
    @Query('timeRange') timeRange: string = 'SHORT_TERM',
  ) {
    const user = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.usersService.findOneWithTopStats(user.id, timeRange);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(UserUpdateIn)) body: {
      displayName?: string;
      bio?: string | null;
      showSpotifyProfile?: boolean;
    }
  ) {
    const user = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.usersService.updateCurrentUser(user.id, body);
  }

  @Post('me/taste-profile')
  @UseGuards(JwtAuthGuard)
  async setTasteProfile(
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(TasteProfileIn)) body: TasteProfileIn,
  ) {
    const user = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.usersService.setManualTasteProfile(user.id, body);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    if (!user) throw new NotFoundException('User not found');

    return this.usersService.deleteUser(user.id);
  }

  @Get('discover')
  @UseGuards(JwtAuthGuard)
  async discoverUsers(
    @CurrentUser() jwtUser: JwtUser,
    @Query('search') search?: string,
  ) {
    const user = await this.usersService.findOrCreateByAuth0Id(jwtUser.sub);
    return this.usersService.findUsersForDiscovery(user.id, search);
  }

  // The routes below were previously missing @UseGuards(JwtAuthGuard),
  // meaning anyone with no token at all could list every user or pull up
  // any user's full profile (top artists/songs included). Every other
  // route in this controller requires auth; these three didn't for no
  // deliberate reason, so they're guarded to match.
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  findProfile(
    @Param('id') id: string,
    @Query('timeRange') timeRange: string = 'SHORT_TERM',
  ) {
    return this.usersService.findOneWithTopStats(id, timeRange);
  }
}
