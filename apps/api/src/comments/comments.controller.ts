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
  async addComment(
    @Param('eventId') eventId: string,
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(EventCommentCreateIn))
    body: { content: string },
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.commentsService.addComment(eventId, user.id, body.content);
  }

  @Patch(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(EventCommentUpdateIn))
    body: { content: string },
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.commentsService.updateComment(commentId, user.id, body.content);
  }

  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() jwtUser: JwtUser,
  ) {
    const user = await this.usersService.findByAuth0Id(jwtUser.sub);
    return this.commentsService.deleteComment(commentId, user.id);
  }
}
