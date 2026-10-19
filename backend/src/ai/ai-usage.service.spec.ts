import { Test } from '@nestjs/testing';
import { HttpException, ServiceUnavailableException } from '@nestjs/common';
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
    process.env.AI_TOTAL_DAILY_LIMIT = '3';
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    delete process.env.AI_DAILY_LIMIT;
    delete process.env.TOTAL_DAILY_LIMIT;
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

  it('みんな合わせた回数が上限に届いたら、まだ話せる人も断る', async () => {
    const a = await prisma.user.create({ data: {} });
    const b = await prisma.user.create({ data: {} });
    await service.consume(a.id);
    await service.consume(a.id);
    await service.consume(b.id);

    // bはまだ1回だけど、みんな合わせた回数が上限に届いている
    await expect(service.consume(b.id)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
