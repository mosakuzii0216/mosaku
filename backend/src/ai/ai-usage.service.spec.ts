import { Test } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { AiUsageService } from './ai-usage.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AiUsageService', () => {
  let service: AiUsageService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [AiUsageService, PrismaService],
    }).compile();

    service = module.get(AiUsageService);
    prisma = module.get(PrismaService);
    process.env.AI_DAILY_LIMIT = '2';
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    delete process.env.AI_DAILY_LIMIT;
    await prisma.$disconnect();
  });

  it('上限までは1回ずつ数えて通し、超えたら断る', async () => {
    const user = await prisma.user.create({ data: {} });

    await service.consume(user.id);
    await service.consume(user.id);

    await expect(service.consume(user.id)).rejects.toThrow(HttpException);
    expect(await prisma.aiUsage.count()).toBe(2);
  });

  it('24時間より前に話した分は数えない', async () => {
    const user = await prisma.user.create({ data: {} });
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await prisma.aiUsage.createMany({
      data: [
        { userId: user.id, createdAt: yesterday },
        { userId: user.id, createdAt: yesterday },
      ],
    });

    await expect(service.consume(user.id)).resolves.toBeUndefined();
  });
});
