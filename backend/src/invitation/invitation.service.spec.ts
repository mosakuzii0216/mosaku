import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { generateCode } from './invitation-code';

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

  // 開発者のコードを使って登録した人を作る
  async function createInvitedUser() {
    const developer = await prisma.user.create({ data: { isDeveloper: true } });
    const user = await prisma.user.create({ data: {} });
    await prisma.invitation.create({
      data: {
        code: generateCode(),
        createdById: developer.id,
        usedById: user.id,
        usedAt: new Date(),
        expiresAt: new Date(),
      },
    });
    return user;
  }

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

  it('create()は3枚まで。取り消した分と、使われずに期限が切れた分は数えない', async () => {
    const user = await createInvitedUser();
    const now = new Date('2026-11-04T12:00:00Z');
    const past = new Date('2026-11-01T00:00:00Z');
    const future = new Date('2026-12-01T00:00:00Z');
    const mine = { createdById: user.id };
    await prisma.invitation.createMany({
      data: [
        // 数えない：使われずに期限が切れた・取り消した
        { ...mine, code: 'AAAAAAAA', expiresAt: past },
        { ...mine, code: 'BBBBBBBB', expiresAt: future, revokedAt: past },
        // 数える：使われた(期限が過ぎていても)
        { ...mine, code: 'CCCCCCCC', expiresAt: past, usedAt: past },
      ],
    });
    expect(await service.remaining(user.id, now)).toBe(2);

    await service.create(user.id, now);
    await service.create(user.id, now);

    await expect(service.create(user.id, now)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('create()は開発者なら何枚でも作る', async () => {
    const developer = await prisma.user.create({ data: { isDeveloper: true } });

    for (let i = 0; i < 4; i++) await service.create(developer.id);

    expect(await prisma.invitation.count()).toBe(4);
    expect(await service.remaining(developer.id)).toBeNull();
  });

  it('revoke()は自分が作った、まだ使われていないコードだけ取り消す', async () => {
    const user = await createInvitedUser();
    const other = await createInvitedUser();
    const mine = await service.create(user.id);
    const used = await service.create(user.id);
    await prisma.invitation.update({
      where: { id: used.id },
      data: { usedAt: new Date() },
    });
    const others = await service.create(other.id);

    await service.revoke(user.id, mine.id);

    // 取り消した分は、また作れる(3枚から、使われた1枚だけを引く)
    expect(await service.remaining(user.id)).toBe(2);
    for (const id of [mine.id, used.id, others.id]) {
      await expect(service.revoke(user.id, id)).rejects.toThrow(
        NotFoundException,
      );
    }
  });
});
