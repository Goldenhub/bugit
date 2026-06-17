import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './comments.schema';
import { Bug, BugDocument } from '../bugs/bugs.schema';
import { IsString, MinLength } from 'class-validator';

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
  ) {}

  private async assertBugOwner(bugId: string, userId: string) {
    const bug = await this.bugModel.findOne({
      _id: new Types.ObjectId(bugId),
      userId,
      deletedAt: null,
    });
    if (!bug) throw new NotFoundException('Bug not found');
    return bug;
  }

  async create(bugId: string, body: string, userId: string): Promise<CommentDocument> {
    await this.assertBugOwner(bugId, userId);
    return this.commentModel.create({ bugId: new Types.ObjectId(bugId), body });
  }

  async findByBug(bugId: string, userId: string): Promise<CommentDocument[]> {
    await this.assertBugOwner(bugId, userId);
    return this.commentModel
      .find({ bugId: new Types.ObjectId(bugId) })
      .sort({ createdAt: 1 })
      .lean() as unknown as CommentDocument[];
  }
}
