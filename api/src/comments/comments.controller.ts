import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommentsService, CreateCommentDto } from './comments.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('bugs/:bugId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Param('bugId') bugId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() userId: string,
  ) {
    return this.commentsService.create(bugId, dto.body, userId);
  }

  @Get()
  findAll(@Param('bugId') bugId: string, @CurrentUser() userId: string) {
    return this.commentsService.findByBug(bugId, userId);
  }
}
