import { Test } from '@nestjs/testing';
import { GoogleAccountService } from './google-account.service';
import { UserService } from '../../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InvitationService } from '../../invitation/invitation.service';

describe('GoogleAccountService', () => {
  let service: GoogleAccountService;
  let prisma: PrismaService;
  let invitations: InvitationService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoogleAccountService,
        UserService,
        InvitationService,
        PrismaService,
      ],
    }).compile();

    service = module.get(GoogleAccountService);
    prisma = module.get(PrismaService);
    invitations = module.get(InvitationService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('初めてのGoogleは、今の匿名ユーザーにそのまま紐づける', async () => {
    const anon = await prisma.user.create({ data: {} });

    const userId = await service.login(anon.id, {
      sub: 'sub-1',
      email: 'a@example.com',
    });

    expect(userId).toBe(anon.id);
    const account = await prisma.account.findFirstOrThrow();
    expect(account.userId).toBe(anon.id);
    expect(account.email).toBe('a@example.com');
  });

  it('同じGoogleでもう一度ログインすると、同じユーザーを返す', async () => {
    const anon = await prisma.user.create({ data: {} });
    await service.login(anon.id, { sub: 'sub-1' });

    const userId = await service.login(anon.id, { sub: 'sub-1' });

    expect(userId).toBe(anon.id);
    expect(await prisma.account.count()).toBe(1);
  });

  it('別の端末の匿名メモを、Googleのユーザーへ引き継ぐ', async () => {
    const owner = await prisma.user.create({ data: {} });
    await service.login(owner.id, { sub: 'sub-1' });
    const otherDevice = await prisma.user.create({ data: {} });
    await prisma.memo.create({
      data: { title: '別の端末のメモ', content: {}, userId: otherDevice.id },
    });

    const userId = await service.login(otherDevice.id, { sub: 'sub-1' });

    expect(userId).toBe(owner.id);
    const memos = await prisma.memo.findMany({ where: { userId: owner.id } });
    expect(memos).toHaveLength(1);
    expect(
      await prisma.user.findUnique({ where: { id: otherDevice.id } }),
    ).toBeNull();
  });

  it('Googleでつないだユーザが別のGoogleでログインしたら、別のユーザを作る', async () => {
    const someone = await prisma.user.create({ data: {} });
    await service.login(someone.id, { sub: 'sub-1' });

    const userId = await service.login(someone.id, { sub: 'sub-2' });

    expect(userId).not.toBe(someone.id);
    expect(await prisma.user.count()).toBe(2);
  });

  it('パスキーだけで登録したユーザーには、初めてGoogleをそのまま繋ぐ', async () => {
    const owner = await prisma.user.create({ data: {} });
    await prisma.passkey.create({
      data: {
        id: 'pk-1',
        userId: owner.id,
        publicKey: Buffer.from([1]),
        transports: [],
      },
    });

    const userId = await service.login(owner.id, { sub: 'sub-1' });

    expect(userId).toBe(owner.id);
    expect(await prisma.user.count()).toBe(1);
  });

  it('初めてのGoogleで招待コードがあれば、繋ぐ前に使う', async () => {
    const developer = await prisma.user.create({ data: { isDeveloper: true } });
    const invitation = await invitations.create(developer.id);
    const anon = await prisma.user.create({ data: {} });

    await service.login(anon.id, { sub: 'sub-1' }, invitation.code);

    expect(await invitations.check(invitation.code)).toBe('used');
  });

  it('招待コードを使えなければ、繋がずに理由を付けて断る', async () => {
    const anon = await prisma.user.create({ data: {} });

    await expect(
      service.login(anon.id, { sub: 'sub-1' }, 'EEEEEEEE'),
    ).rejects.toMatchObject({ reason: 'not_found' });
    expect(await prisma.account.count()).toBe(0);
  });

  it('前に登録したGoogleなら、招待コードは使わずに残す', async () => {
    const developer = await prisma.user.create({ data: { isDeveloper: true } });
    const invitation = await invitations.create(developer.id);
    const anon = await prisma.user.create({ data: {} });
    await service.login(anon.id, { sub: 'sub-1' });

    await service.login(anon.id, { sub: 'sub-1' }, invitation.code);

    expect(await invitations.check(invitation.code)).toBeNull();
  });
});
