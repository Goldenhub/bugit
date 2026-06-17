import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BugsController } from './bugs.controller';
import { BugsService } from './bugs.service';
import { Bug, BugSchema } from './bugs.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bug.name, schema: BugSchema }])],
  controllers: [BugsController],
  providers: [BugsService],
  exports: [BugsService, MongooseModule],
})
export class BugsModule {}
