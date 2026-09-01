import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Memo } from '../../generated/prisma/client';

@Injectable()
export class MemoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    title: string;
    content: unknown;
    userId: string;
  }): Promise<Memo> {
    return this.prisma.memo.create({
      data: {
        title: input.title,
        content: input.content,
        userId: input.userId,
      },
    });
  }
}
