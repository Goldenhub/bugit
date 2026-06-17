import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bug, BugDocument } from '../bugs/bugs.schema';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
export class MetaController {
  constructor(@InjectModel(Bug.name) private bugModel: Model<BugDocument>) {}

  @Get('projects')
  async getProjects(@CurrentUser() userId: string) {
    const projects = await this.bugModel.distinct('project', {
      userId,
      deletedAt: null,
      project: { $ne: '' },
    });
    return projects.sort();
  }

  @Get('tags')
  async getTags(@CurrentUser() userId: string) {
    const tags = await this.bugModel.distinct('tags', { userId, deletedAt: null });
    return tags.sort();
  }

  @Get('stats')
  async getStats(@CurrentUser() userId: string) {
    const base = { userId, deletedAt: null };

    const [byStatus, bySeverity, byProject] = await Promise.all([
      this.bugModel.aggregate([
        { $match: base },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.bugModel.aggregate([
        { $match: base },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      this.bugModel.aggregate([
        { $match: { ...base, project: { $ne: '' } } },
        { $group: { _id: '$project', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const toMap = (arr: { _id: string; count: number }[]) =>
      Object.fromEntries(arr.map((r) => [r._id, r.count]));

    const statusMap = toMap(byStatus);

    return {
      total: Object.values(statusMap).reduce((a, b) => a + b, 0),
      byStatus: statusMap,
      bySeverity: toMap(bySeverity),
      byProject: toMap(byProject),
    };
  }
}
