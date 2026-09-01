import { Test } from '@nestjs/testing';
import { MemoService } from './memo.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MemoService', () => {
  let service: MemoService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [MemoService, PrismaService],
    }).compile();

    service = module.get(MemoService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.memo.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('create()はメモを1件作ってidを返す', async () => {
    const memo = await service.create({
      title: '2026-09-02',
      content: { type: 'doc', content: [] },
      userId: 'user-1',
    });
    expect(memo.id).toBeDefined();

    const saved = await prisma.memo.findMany();
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe(memo.id);
  });
});
