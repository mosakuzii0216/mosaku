import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Memo, Prisma } from '../../generated/prisma/client';

@Injectable()
export class MemoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    title: string;
    content: Prisma.InputJsonValue;
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

  async findAll(userId: string): Promise<Memo[]> {
    return this.prisma.memo.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
