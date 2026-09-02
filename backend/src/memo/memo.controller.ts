import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
