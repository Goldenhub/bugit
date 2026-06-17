import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BugsService, BugListQuery } from './bugs.service';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('bugs')
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Post()
  create(@Body() dto: CreateBugDto, @CurrentUser() userId: string) {
    return this.bugsService.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: BugListQuery, @CurrentUser() userId: string) {
    return this.bugsService.findAll(query, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.bugsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBugDto,
    @CurrentUser() userId: string,
  ) {
    return this.bugsService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() userId: string) {
    await this.bugsService.softDelete(id, userId);
  }
}
