import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PasskeyService', () => {
  let service: PasskeyService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PasskeyService, PrismaService],
    }).compile();
    service = module.get(PasskeyService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('登録オプションにchallengeと既存パスキーの除外リストが入る', async () => {
    const user = await prisma.user.create({ data: {} });

    const options = await service.buildRegistrationOptions(user.id);

    expect(options.challenge).toBeDefined();
    expect(options.rp.id).toBe('localhost');
    expect(options.excludeCredentials).toHaveLength(0);
  });

  it('既に登録済みのパスキーは除外リストに入る', async () => {
    const user = await prisma.user.create({ data: {} });
    await prisma.passkey.create({
      data: {
        id: 'existing-credential-id',
        userId: user.id,
        publicKey: Buffer.from([1, 2, 3]),
        transports: ['internal'],
      },
    });
    const options = await service.buildRegistrationOptions(user.id);

    expect(options.excludeCredentials?.[0].id).toBe('existing-credential-id');
  });

  it('偽のレスポンスは検証に失敗する', async () => {
    const user = await prisma.user.create({ data: {} });

    await expect(
      service.verifyRegistration(
        user.id,
        { id: 'x', rawId: 'x', type: 'public-key', response: {} } as never,
        'challenge',
      ),
    ).rejects.toThrow();

    expect(await prisma.passkey.count()).toBe(0);
  });
});
