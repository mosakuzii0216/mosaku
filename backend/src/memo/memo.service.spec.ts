import { Test } from '@nestjs/testing';
import { MemoService } from './memo.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

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

  it('update()は自分のメモを更新する', async () => {
    const memo = await service.create({
      title: 'もとのタイトル',
      content: { type: 'doc', content: [] },
      userId: 'user-1',
    });

    const updated = await service.update('user-1', memo.id, {
      title: '新しいタイトル',
      content: { type: 'doc', content: [] },
    });

    expect(updated.title).toBe('新しいタイトル');
  });

  it('update()は他人のメモを更新しない', async () => {
    const memo = await service.create({
      title: '他人のメモ',
      content: { type: 'doc', content: [] },
      userId: 'user-2',
    });

    await expect(
      service.update('user-1', memo.id, {
        title: '乗っ取り',
        content: { type: 'doc', content: [] },
      }),
    ).rejects.toThrow(NotFoundException);

    const saved = await prisma.memo.findUniqueOrThrow({
      where: { id: memo.id },
    });
    expect(saved.title).toBe('他人のメモ');
  });

  it('remove()は自分のメモを削除する', async () => {
    const memo = await service.create({
      title: '消すメモ',
      content: { type: 'doc', content: [] },
      userId: 'user-1',
    });

    await service.remove('user-1', memo.id);

    expect(await prisma.memo.count()).toBe(0);
  });

  it('remove()は他人のメモを削除しない', async () => {
    const memo = await service.create({
      title: '他人のメモ',
      content: { type: 'doc', content: [] },
      userId: 'user-2',
    });

    await expect(service.remove('user-1', memo.id)).rejects.toThrow(
      NotFoundException,
    );

    expect(await prisma.memo.count()).toBe(1);
  });
});
