import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InvitationService', () => {
  let service: InvitationService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [InvitationService, UserService, PrismaService],
    }).compile();

    service = module.get(InvitationService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('create()はプレミアムの人に、1か月で切れるコードを作る', async () => {
    const developer = await prisma.user.create({ data: { isDeveloper: true } });

    const invitation = await service.create(
      developer.id,
      new Date('2026-11-04T12:00:00Z'),
    );

    expect(invitation.code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(invitation.createdById).toBe(developer.id);
    expect(invitation.expiresAt).toEqual(new Date('2026-12-04T12:00:00Z'));
  });

  it('create()はプレミアムでない人には作らない', async () => {
    const user = await prisma.user.create({ data: {} });

    await expect(service.create(user.id)).rejects.toThrow(ForbiddenException);
    expect(await prisma.invitation.count()).toBe(0);
  });
});
