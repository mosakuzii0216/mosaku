import { Injectable, NotFoundException } from '@nestjs/common';
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

  async update(
    userId: string,
    id: string,
    input: { title: string; content: Prisma.InputJsonValue },
  ): Promise<Memo> {
    const { count } = await this.prisma.memo.updateMany({
      where: { id, userId },
      data: { title: input.title, content: input.content },
    });

    if (count === 0) {
      throw new NotFoundException();
    }
    return this.prisma.memo.findUniqueOrThrow({ where: { id } });
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.memo.deleteMany({
      where: { id, userId },
    });

    if (count === 0) {
      throw new NotFoundException();
    }
  }
}
