import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Bug, BugDocument } from './bugs.schema';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';

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
  constructor(@InjectModel(Bug.name) private bugModel: Model<BugDocument>) {}

  async create(dto: CreateBugDto, userId: string): Promise<BugDocument> {
    const bug = new this.bugModel({ ...dto, userId });
    return bug.save();
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

    return { bugs, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<BugDocument> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid bug ID');
    const bug = await this.bugModel.findOne({ _id: id, userId, deletedAt: null });
    if (!bug) throw new NotFoundException(`Bug ${id} not found`);
    return bug;
  }

  async update(id: string, dto: UpdateBugDto, userId: string): Promise<BugDocument> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid bug ID');
    const bug = await this.bugModel.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      dto,
      { new: true },
    );
    if (!bug) throw new NotFoundException(`Bug ${id} not found`);
    return bug;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid bug ID');
    const result = await this.bugModel.updateOne(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
    );
    if (result.matchedCount === 0) throw new NotFoundException(`Bug ${id} not found`);
  }
}
