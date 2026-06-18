import {
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Bug, BugDocument } from './bugs.schema';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { PinoLoggerService } from '../pino-logger.service';
import { AppException } from '../exceptions/app-exception';
import { ErrorCodes } from '../exceptions/error-codes';

export interface BugListQuery {
  project?: string;
  severity?: string;
  status?: string;
  source?: string;
  tags?: string;
  search?: string;
  limit?: number;
  page?: number;
}

@Injectable()
export class BugsService {
  constructor(
    @InjectModel(Bug.name) private bugModel: Model<BugDocument>,
    private readonly logger: PinoLoggerService,
  ) {
    this.logger.setContext(BugsService.name);
  }

  async create(dto: CreateBugDto, userId: string): Promise<BugDocument> {
    const bug = new this.bugModel({ ...dto, userId });
    const saved = await bug.save();
    this.logger.log(`Bug created id=${saved._id} title="${saved.title}" user=${userId}`);
    return saved;
  }

  async findAll(query: BugListQuery, userId: string) {
    const filter: Record<string, unknown> = { userId, deletedAt: null };

    if (query.project) filter.project = query.project;
    if (query.severity) filter.severity = query.severity;
    if (query.status) filter.status = query.status;
    if (query.source) filter.source = query.source;
    if (query.tags) {
      filter.tags = { $in: query.tags.split(',').map((t) => t.trim()) };
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const limit = Math.min(Number(query.limit) || 20, 100);
    const page = Math.max(Number(query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [bugs, total] = await Promise.all([
      this.bugModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.bugModel.countDocuments(filter),
    ]);

    this.logger.debug(`Bugs listed user=${userId} total=${total} page=${page}`);
    return { bugs, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<BugDocument> {
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid bug ID requested id=${id} user=${userId}`);
      throw new AppException('Invalid bug ID', HttpStatus.BAD_REQUEST, ErrorCodes.BUG_INVALID_ID);
    }
    const bug = await this.bugModel.findOne({ _id: id, userId, deletedAt: null });
    if (!bug) {
      this.logger.warn(`Bug not found id=${id} user=${userId}`);
      throw new AppException(`Bug ${id} not found`, HttpStatus.NOT_FOUND, ErrorCodes.BUG_NOT_FOUND);
    }
    return bug;
  }

  async update(id: string, dto: UpdateBugDto, userId: string): Promise<BugDocument> {
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid bug ID for update id=${id} user=${userId}`);
      throw new AppException('Invalid bug ID', HttpStatus.BAD_REQUEST, ErrorCodes.BUG_INVALID_ID);
    }
    const bug = await this.bugModel.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      dto,
      { new: true },
    );
    if (!bug) {
      this.logger.warn(`Bug not found for update id=${id} user=${userId}`);
      throw new AppException(`Bug ${id} not found`, HttpStatus.NOT_FOUND, ErrorCodes.BUG_NOT_FOUND);
    }
    this.logger.log(`Bug updated id=${id} user=${userId}`);
    return bug;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid bug ID for delete id=${id} user=${userId}`);
      throw new AppException('Invalid bug ID', HttpStatus.BAD_REQUEST, ErrorCodes.BUG_INVALID_ID);
    }
    const result = await this.bugModel.updateOne(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
    );
    if (result.matchedCount === 0) {
      this.logger.warn(`Bug not found for delete id=${id} user=${userId}`);
      throw new AppException(`Bug ${id} not found`, HttpStatus.NOT_FOUND, ErrorCodes.BUG_NOT_FOUND);
    }
    this.logger.log(`Bug soft-deleted id=${id} user=${userId}`);
  }
}
