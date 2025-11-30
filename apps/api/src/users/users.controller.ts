import { 
  Controller, Delete, Get, Patch, Param, Body, Query, UseGuards 
} from '@nestjs/common';
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
    let user = await this.usersService.findByAuth0Id(jwtUser.sub);

    if (!user) {
      user = await this.usersService.createUserFromAuth0(jwtUser.sub);
    }

    return this.usersService.getCurrentUser(user.id);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  async getMeProfile(
    @CurrentUser() jwtUser: JwtUser,
    @Query('timeRange') timeRange: string = 'SHORT_TERM',
  ) {
    let user = await this.usersService.findByAuth0Id(jwtUser.sub);

    if (!user) {
      user = await this.usersService.createUserFromAuth0(jwtUser.sub);
    }

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
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.usersService.updateCurrentUser(user.id, body);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    if (!user) throw new Error('User not found');

    return this.usersService.deleteUser(user.id);
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
  findProfile(
    @Param('id') id: string,
    @Query('timeRange') timeRange: string = 'SHORT_TERM',
  ) {
    return this.usersService.findOneWithTopStats(id, timeRange);
  }
}
