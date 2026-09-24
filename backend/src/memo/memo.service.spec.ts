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

  it('remove()は自分のメモをゴミ箱に移す', async () => {
    const memo = await service.create({
      title: '消すメモ',
      content: {},
      userId: 'user-1',
    });

    await service.remove('user-1', memo.id);

    // レコードは残っている
    expect(await prisma.memo.count()).toBe(1);
    // 一覧には出ない
    expect(await service.findAll('user-1')).toHaveLength(0);
    // ゴミ箱には出る
    expect(await service.findTrashed('user-1')).toHaveLength(1);
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

  it('restore()はゴミ箱から戻す', async () => {
    const memo = await service.create({
      title: '戻すメモ',
      content: {},
      userId: 'user-1',
    });
    await service.remove('user-1', memo.id);

    await service.restore('user-1', memo.id);

    expect(await service.findAll('user-1')).toHaveLength(1);
    expect(await service.findTrashed('user-1')).toHaveLength(0);
  });

  it('purge()はゴミ箱に入っていないメモを消さない', async () => {
    const memo = await service.create({
      title: '生きてるメモ',
      content: {},
      userId: 'user-1',
    });

    await expect(service.purge('user-1', memo.id)).rejects.toThrow(
      NotFoundException,
    );
    expect(await prisma.memo.count()).toBe(1);
  });

  it('search()はタイトルと本文の両方から探す', async () => {
    await service.create({
      title: '写経の記録',
      content: { type: 'doc', content: [] },
      userId: 'user-1',
    });
    await service.create({
      title: '無題',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '今日は写経した' }],
          },
        ],
      },
      userId: 'user-1',
    });

    expect(await service.search('user-1', '写経')).toHaveLength(2);
  });

  it('search()は他人のメモを返さない', async () => {
    await service.create({
      title: '他人の写経',
      content: { type: 'doc', content: [] },
      userId: 'user-2',
    });

    expect(await service.search('user-1', '写経')).toHaveLength(0);
  });

  it('search()はゴミ箱のメモを返さない', async () => {
    const memo = await service.create({
      title: '捨てた写経',
      content: { type: 'doc', content: [] },
      userId: 'user-1',
    });
    await service.remove('user-1', memo.id);

    expect(await service.search('user-1', '写経')).toHaveLength(0);
  });

  it('search()は空文字で全件を返さない', async () => {
    await service.create({
      title: 'メモ',
      content: { type: 'doc', content: [] },
      userId: 'user-1',
    });

    expect(await service.search('user-1', '')).toHaveLength(0);
    expect(await service.search('user-1', '   ')).toHaveLength(0);
  });
});
