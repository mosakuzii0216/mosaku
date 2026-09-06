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
    await prisma.user.deleteMany();
    await prisma.user.createMany({
      data: [{ id: 'user-1' }, { id: 'user-2' }],
    });
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

  it('findAll()は自分のメモだけを返す', async () => {
    await service.create({
      title: 'わたしのメモ',
      content: { type: 'doc', content: [] },
      userId: 'user-1',
    });
    await service.create({
      title: '他人のメモ',
      content: { type: 'doc', content: [] },
      userId: 'user-2',
    });

    const memos = await service.findAll('user-1');

    expect(memos).toHaveLength(1);
    expect(memos[0].title).toBe('わたしのメモ');
  });
});
