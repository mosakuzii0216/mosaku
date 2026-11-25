import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { InvitationService } from '../src/invitation/invitation.service';

describe('Me (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /me は初めての相手に、登録状態だけを返す', async () => {
    const res = await request(app.getHttpServer()).get('/me').expect(200);

    // idなど余計なものが混ざっていないことも確かめる
    expect(res.body).toEqual({
      hasPasskey: false,
      hasGoogle: false,
      isPremium: false,
    });
  });

  it('GET /me はパスキーを持つユーザにhasPasskey: trueを返す', async () => {
    const agent = request.agent(app.getHttpServer());
    // 1回目のアクセスで匿名ユーザが作られ、Cookieが付く
    await agent.get('/me').expect(200);
    const user = await prisma.user.findFirstOrThrow();
    await prisma.passkey.create({
      data: {
        id: 'pk-1',
        userId: user.id,
        publicKey: Buffer.from([1]),
        transports: [],
      },
    });

    const res = await agent.get('/me').expect(200);

    expect(res.body).toEqual({
      hasPasskey: true,
      hasGoogle: false,
      isPremium: false,
    });
  });

  it('GET /me はGoogleと連携したユーザにhasGoogle: trueを返す', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/me').expect(200);
    const user = await prisma.user.findFirstOrThrow();
    await prisma.account.create({
      data: { provider: 'google', providerAccountId: 'sub-1', userId: user.id },
    });

    const res = await agent.get('/me').expect(200);

    expect(res.body).toEqual({
      hasPasskey: false,
      hasGoogle: true,
      isPremium: false,
    });
  });

  it('GET /me は招待コードで登録したユーザにisPremium: trueを返す', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/me').expect(200);
    const user = await prisma.user.findFirstOrThrow();
    const developer = await prisma.user.create({ data: { isDeveloper: true } });
    const invitations = app.get(InvitationService);
    const invitation = await invitations.create(developer.id);
    await invitations.use(invitation.code, user.id);

    const res = await agent.get('/me').expect(200);

    expect(res.body).toEqual({
      hasPasskey: false,
      hasGoogle: false,
      isPremium: true,
    });
  });

  it('POST /me/logout は名札を消し、次のアクセスは別の匿名ユーザーになる', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/me').expect(200);
    const before = await prisma.user.findFirstOrThrow();

    await agent.post('/me/logout').expect(204);
    const res = await agent.get('/me').expect(200);

    // 名札が消えたので、新しい匿名ユーザーの名札が発行される
    expect(res.headers['set-cookie']).toBeDefined();
    expect(await prisma.user.count()).toBe(2);
    // 前のユーザーとメモはサーバーに残る（パスキーかGoogleでまた入れる）
    expect(
      await prisma.user.findUnique({ where: { id: before.id } }),
    ).not.toBeNull();
  });

  it('GET /meは、名札の期限を延ばすために同じ名札を付け直す', async () => {
    const agent = request.agent(app.getHttpServer());
    const first = await agent.get('/me').expect(200);

    const res = await agent.get('/me').expect(200);

    expect(userCookie(res)).toBe(userCookie(first));
  });

  describe('本番のように、名札をmosaku.jp全体に付けるとき', () => {
    beforeEach(() => {
      process.env.COOKIE_DOMAIN = 'mosaku.jp';
    });

    afterEach(() => {
      delete process.env.COOKIE_DOMAIN;
    });

    it('GET /meは、前の名札を消してから、mosaku.jp全体に名札を付ける', async () => {
      const res = await request(app.getHttpServer()).get('/me').expect(200);

      const cookie = setCookies(res);
      expect(cookie[0]).toMatch(/^mosaku_uid=;/);
      expect(cookie[0]).not.toContain('Domain=');
      expect(cookie[1]).toMatch(/^mosaku_uid=s%3A/);
      expect(cookie[1]).toContain('Domain=mosaku.jp');
    });

    it('POST /me/logoutは前の名札もmosaku.jp全体の名札も消す', async () => {
      const res = await request(app.getHttpServer())
        .post('/me/logout')
        .expect(204);

      const cleared = setCookies(res).filter((c) =>
        c.startsWith('mosaku_uid=;'),
      );
      expect(cleared.some((c) => !c.includes('Domain='))).toBe(true);
      expect(cleared.some((c) => c.includes('Domain=mosaku.jp'))).toBe(true);
    });
  });
});

// 返事のSet-Cookieを、1つずつの配列にする
function setCookies(res: request.Response): string[] {
  return ([] as string[]).concat(res.headers['set-cookie'] ?? []);
}

// 返事のSet-Cookieから、名札の「名前=値」だけを取り出す
function userCookie(res: request.Response): string | undefined {
  return setCookies(res)
    .find((c) => c.startsWith('mosaku_uid='))
    ?.split(';')[0];
}
