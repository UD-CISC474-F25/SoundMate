import { Controller, Get, Patch, Param, Body, Query, UseGuards, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { UserUpdateIn } from '@repo/api';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.usersService.getCurrentUser(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(UserUpdateIn))
  async updateMe(
    @CurrentUser() jwtUser: JwtUser,
    @Body() body: { displayName?: string; bio?: string | null; showSpotifyProfile?: boolean },
  ) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.usersService.updateCurrentUser(user.id, body);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/profile')
  findProfile(@Param('id') id: string, @Query('timeRange') timeRange?: string) {
    return this.usersService.findOneWithTopArtists(id, timeRange as any);
  }
}