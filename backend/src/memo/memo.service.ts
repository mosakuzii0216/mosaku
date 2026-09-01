import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MemoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { title: string; content: unknown; userId: string }) {
    throw new Error('not implemented');
  }
}
