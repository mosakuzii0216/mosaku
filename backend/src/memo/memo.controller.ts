import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MemoService } from './memo.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { Prisma } from '../../generated/prisma/client';

@Controller('memos')
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() body: { title: string; content: Prisma.InputJsonValue },
  ) {
    return this.memoService.create({ ...body, userId: user.id });
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.memoService.findAll(user.id);
  }

  @Get('trash')
  findTrashed(@CurrentUser() user: { id: string }) {
    return this.memoService.findTrashed(user.id);
  }

  @Get('search')
  search(@CurrentUser() user: { id: string }, @Query('q') q?: string) {
    return this.memoService.search(user.id, q ?? '');
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: { title: string; content: Prisma.InputJsonValue },
  ) {
    return this.memoService.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.memoService.remove(user.id, id);
  }

  @Post(':id/restore')
  restore(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.memoService.restore(user.id, id);
  }

  @Delete(':id/purge')
  @HttpCode(HttpStatus.NO_CONTENT)
  purge(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.memoService.purge(user.id, id);
  }
}
