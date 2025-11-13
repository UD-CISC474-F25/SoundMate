import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { UsersService } from '../users/users.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { EventCommentCreateIn, EventCommentUpdateIn } from '@repo/api';

@Controller('events/:eventId/comments')
@UseGuards(JwtAuthGuard)  
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getComments(@Param('eventId') eventId: string) {
    return this.commentsService.getComments(eventId);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(EventCommentCreateIn))
  async addComment(
    @Param('eventId') eventId: string,
    @CurrentUser() jwtUser: JwtUser,
    @Body() body: { content: string },
  ) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.commentsService.addComment(eventId, user.id, body.content);
  }


@Patch(':commentId')
@UsePipes(new ZodValidationPipe(EventCommentUpdateIn))
async updateComment(
  @Param('commentId') commentId: string,
  @CurrentUser() jwtUser: JwtUser,
  @Body() body: { content: string },
) {
  const user = await this.usersService.findByEmail(jwtUser.email);
  return this.commentsService.updateComment(commentId, user.id, body.content);
}

  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() jwtUser: JwtUser,
  ) {
    const user = await this.usersService.findByEmail(jwtUser.email);
    return this.commentsService.deleteComment(commentId, user.id);
  }
}
