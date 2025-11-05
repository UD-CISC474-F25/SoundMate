import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /*
  @Get('me')
  @UseGuards(JwtAuthGuard)
  
  async getMe(@CurrentUser() jwtUser: JwtUser) {
    // Try to find user by Auth0 ID
    let user = await this.usersService.findByAuth0Id(jwtUser.sub);

    // If user doesn't exist, create them automatically
    if (!user) {
      user = await this.usersService.createFromAuth0(jwtUser,);
    }

    return user;
  }
*/
}