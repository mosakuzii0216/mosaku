import { Test } from '@nestjs/testing';
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { formatCode, generateCode } from './invitation-code';

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

  it('list()は自分のコードの新しい順に、状態を付けて返す', async () => {
    const user = await createInvitedUser();
    const other = await createInvitedUser();
    // 作った順ではなく作った日で並ぶの確かめるため、新しい方を先に作る
    const newer = await service.create(user.id, new Date('2026-11-02'));
    const older = await service.create(user.id, new Date('2026-11-01'));
    await service.revoke(user.id, newer.id);
    // 人のコードは入らない
    await service.create(other.id);

    expect(await service.list(user.id, new Date('2026-11-04'))).toEqual([
      {
        id: newer.id,
        code: formatCode(newer.code),
        expiresAt: newer.expiresAt,
        status: 'revoked',
      },
      {
        id: older.id,
        code: formatCode(older.code),
        expiresAt: older.expiresAt,
        status: 'unused',
      },
    ]);
  });

  it('check()は使えるコードならnull、使えなければ理由を返す', async () => {
    const developer = await prisma.user.create({ data: { isDeveloper: true } });
    const now = new Date('2026-11-04T12:00:00Z');
    const past = new Date('2026-11-01T00:00:00Z');
    const future = new Date('2026-12-01T00:00:00Z');
    const mine = { createdById: developer.id };
    await prisma.invitation.createMany({
      data: [
        { ...mine, code: 'AAAAAAAA', expiresAt: future },
        { ...mine, code: 'BBBBBBBB', expiresAt: future, usedAt: past },
        { ...mine, code: 'CCCCCCCC', expiresAt: past },
        { ...mine, code: 'DDDDDDDD', expiresAt: future, revokedAt: past },
      ],
    });

    // 小文字やハイフンが混じっていても確かめられる
    expect(await service.check('aaaa-aaaa', now)).toBeNull();
    expect(await service.check('BBBBBBBB', now)).toBe('used');
    expect(await service.check('CCCCCCCC', now)).toBe('expired');
    expect(await service.check('DDDDDDDD', now)).toBe('revoked');
    expect(await service.check('EEEEEEEE', now)).toBe('not_found');
  });

  it('use()はコードを使い、もう誰にも使わせない', async () => {
    const developer = await prisma.user.create({ data: { isDeveloper: true } });
    const invitation = await service.create(developer.id);
    const alice = await prisma.user.create({ data: {} });
    const bob = await prisma.user.create({ data: {} });

    // 小文字やハイフンが混じっていても使える
    const code = formatCode(invitation.code).toLowerCase();
    expect(await service.use(code, alice.id)).toBeNull();
    expect(await service.use(code, bob.id)).toBe('used');
    expect(await service.use('EEEEEEEE', bob.id)).toBe('not_found');
    const used = await prisma.invitation.findUniqueOrThrow({
      where: { id: invitation.id },
    });
    expect(used.usedById).toBe(alice.id);
  });

  it('use()は、同時に使われても1人にしか使わせない', async () => {
    const developer = await prisma.user.create({ data: { isDeveloper: true } });
    const invitation = await service.create(developer.id);
    const alice = await prisma.user.create({ data: {} });
    const bob = await prisma.user.create({ data: {} });

    const results = await Promise.all([
      service.use(invitation.code, alice.id),
      service.use(invitation.code, bob.id),
    ]);
    // どちらか1人だけ使えて、もう一人には「使われた」を返す
    expect(results).toContain(null);
    expect(results).toContain('used');
  });

  it('use()でコードが使われたら、Slackに知らせるために1行のログを残す', async () => {
    // ログは画面を出さずに、何を出したかだけを見る
    const log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    const developer = await prisma.user.create({ data: { isDeveloper: true } });
    const invitation = await service.create(developer.id);
    await service.create(developer.id);
    // 取り消したコードは、配っていないことにする
    const revoked = await service.create(developer.id);
    await service.revoke(developer.id, revoked.id);
    const alice = await prisma.user.create({ data: {} });

    await service.use(invitation.code, alice.id);

    expect(log).toHaveBeenCalledWith(
      '招待で1人が登録（開発者の招待は2人中1人）',
    );
  });
});
