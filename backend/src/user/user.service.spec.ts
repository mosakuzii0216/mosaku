import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get(UserService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('IDを持たない相手にはユーザを1件作ってIDを返す', async () => {
    const user = await service.findOrCreate(undefined);

    expect(user.id).toBeDefined();
    expect(await prisma.user.count()).toBe(1);
  });

  it('既存のIDを持つ相手には作らずにそのユーザを返す', async () => {
    const existing = await prisma.user.create({ data: {} });

    const user = await service.findOrCreate(existing.id);

    expect(user.id).toBe(existing.id);
    expect(await prisma.user.count()).toBe(1);
  });

  it('DBに存在しないIDを持つ相手には新しく作り直す', async () => {
    const user = await service.findOrCreate('もう消えたID');

    expect(user.id).not.toBe('もう消えたID');
    expect(await prisma.user.count()).toBe(1);
  });

  it('merge()は匿名ユーザのメモを引き継いで匿名ユーザを消す', async () => {
    const anon = await prisma.user.create({ data: {} });
    const owner = await prisma.user.create({ data: {} });
    await prisma.memo.create({
      data: { title: '匿名で書いたメモ', content: {}, userId: anon.id },
    });

    await service.merge(anon.id, owner.id);

    const memos = await prisma.memo.findMany({ where: { userId: owner.id } });
    expect(memos).toHaveLength(1);
    expect(await prisma.user.findUnique({ where: { id: anon.id } })).toBeNull();
  });

  it('merge()はパスキーを持つユーザを吸収しない', async () => {
    const other = await prisma.user.create({ data: {} });
    const owner = await prisma.user.create({ data: {} });
    await prisma.passkey.create({
      data: {
        id: 'pk-1',
        userId: other.id,
        publicKey: Buffer.from([1]),
        transports: [],
      },
    });

    await service.merge(other.id, owner.id);

    expect(
      await prisma.user.findUnique({ where: { id: other.id } }),
    ).not.toBeNull();
  });
});
