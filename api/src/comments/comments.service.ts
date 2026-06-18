import {
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './comments.schema';
import { Bug, BugDocument } from '../bugs/bugs.schema';
import { IsString, MinLength } from 'class-validator';
import { PinoLoggerService } from '../pino-logger.service';
import { AppException } from '../exceptions/app-exception';
import { ErrorCodes } from '../exceptions/error-codes';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  body: string;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Bug.name) private bugModel: Model<BugDocument>,
    private readonly logger: PinoLoggerService,
  ) {
    this.logger.setContext(CommentsService.name);
  }

  private async assertBugOwner(bugId: string, userId: string) {
    const bug = await this.bugModel.findOne({
      _id: new Types.ObjectId(bugId),
      userId,
      deletedAt: null,
    });
    if (!bug) {
      this.logger.warn(`Comment ownership check failed bugId=${bugId} user=${userId}`);
      throw new AppException('Bug not found', HttpStatus.NOT_FOUND, ErrorCodes.COMMENT_BUG_NOT_FOUND);
    }
    return bug;
  }

  async create(bugId: string, body: string, userId: string): Promise<CommentDocument> {
    await this.assertBugOwner(bugId, userId);
    const comment = await this.commentModel.create({ bugId: new Types.ObjectId(bugId), body });
    this.logger.log(`Comment created id=${comment._id} bugId=${bugId} user=${userId}`);
    return comment;
  }

  async findByBug(bugId: string, userId: string): Promise<CommentDocument[]> {
    await this.assertBugOwner(bugId, userId);
    const comments = await this.commentModel
      .find({ bugId: new Types.ObjectId(bugId) })
      .sort({ createdAt: 1 })
      .lean() as unknown as CommentDocument[];
    this.logger.debug(`Comments listed bugId=${bugId} count=${comments.length}`);
    return comments;
  }
}
