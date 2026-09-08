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
});
