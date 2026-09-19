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
      where: { userId, trashedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(
    userId: string,
    id: string,
    input: { title: string; content: Prisma.InputJsonValue },
  ): Promise<Memo> {
    const { count } = await this.prisma.memo.updateMany({
      where: { id, userId, trashedAt: null },
      data: { title: input.title, content: input.content },
    });

    if (count === 0) {
      throw new NotFoundException();
    }
    return this.prisma.memo.findUniqueOrThrow({ where: { id } });
  }

  // 完全削除ではなくゴミ箱へ移す
  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.memo.updateMany({
      where: { id, userId, trashedAt: null },
      data: { trashedAt: new Date() },
    });

    if (count === 0) {
      throw new NotFoundException();
    }
  }

  async findTrashed(userId: string): Promise<Memo[]> {
    return this.prisma.memo.findMany({
      where: { userId, trashedAt: { not: null } },
      orderBy: { trashedAt: 'desc' },
    });
  }

  async restore(userId: string, id: string): Promise<Memo> {
    const { count } = await this.prisma.memo.updateMany({
      where: { id, userId, trashedAt: { not: null } },
      data: { trashedAt: null },
    });

    if (count === 0) {
      throw new NotFoundException();
    }
    return this.prisma.memo.findUniqueOrThrow({ where: { id } });
  }

  // ゴミ箱の中身だけ完全に消す。復元できない。
  async purge(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.memo.deleteMany({
      where: { id, userId, trashedAt: { not: null } },
    });

    if (count === 0) {
      throw new NotFoundException();
    }
  }
}
