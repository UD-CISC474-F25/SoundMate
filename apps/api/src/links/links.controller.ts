import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto, UpdateLinkDto } from '@repo/api';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { UsersService } from '../users/users.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@Controller('links')
@UseGuards(JwtAuthGuard)
export class LinksController {
  constructor(
    private readonly linksService: LinksService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(CreateLinkDto)) createLinkDto: CreateLinkDto,
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.linksService.create(user.id, createLinkDto);
  }

  @Get()
  async findAll(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.linksService.findAll(user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() jwtUser: JwtUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateLinkDto)) updateLinkDto: UpdateLinkDto,
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.linksService.update(id, user.id, updateLinkDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() jwtUser: JwtUser, @Param('id') id: string) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.linksService.remove(id, user.id);
  }
}
