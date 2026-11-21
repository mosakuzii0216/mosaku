import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { XClient } from '../src/auth/x/x.client';

const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// Xに問い合わせる代わりに、決まったIDを返す偽物
const fetchUserId = jest.fn().mockResolvedValue('x-user-1');

describe('Xでログイン(e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(XClient)
      .useValue({ fetchUserId })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // 匿名の名札をもらってからstartを通り、Xへ渡すはずだった合言葉を取り出す
  async function startLogin(agent: ReturnType<typeof request.agent>) {
    await agent.get('/me').expect(200);
    const res = await agent.get('/auth/x/start').expect(302);
    return new URL(res.headers.location).searchParams.get('state');
  }

  it('GET /auth/x/start はPKCE付きでXのログイン画面へ送る', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/x/start')
      .expect(302);
    const url = new URL(res.headers.location);
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://x.com/i/oauth2/authorize',
    );
    expect(url.searchParams.get('scope')).toBe('users.read tweet.read');
    expect(url.searchParams.get('state')).toBeTruthy();
    // SHA-256をbase64urlにすると、+や/や=の無い43文字になる
    expect(url.searchParams.get('code_challenge')).toMatch(/^[\w-]{43}$/);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
  });

  it('GET /auth/x/start は合言葉と鍵と招待コードをCookieに預ける', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/x/start?invite=ABCD-EFGH')
      .expect(302);

    const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
    expect(cookies.some((c) => c.startsWith('mosaku_x_state='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('mosaku_x_verifier='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('mosaku_x_invite='))).toBe(true);
  });

  it('GET /auth/x/callback は合言葉が合えば、Xの人をつないで画面へ戻す', async () => {
    const agent = request.agent(app.getHttpServer());
    const state = await startLogin(agent);

    const res = await agent
      .get(`/auth/x/callback?code=fake-code&state=${state}`)
      .expect(302);

    expect(res.headers.location).toBe(FRONTEND);
    expect(fetchUserId).toHaveBeenCalledWith('fake-code', expect.any(String));
    const user = await prisma.user.findFirstOrThrow();
    const account = await prisma.account.findFirstOrThrow();
    expect(account.userId).toBe(user.id);
    expect(account.provider).toBe('x');
    expect(account.providerAccountId).toBe('x-user-1');
  });

  it('GET /auth/x/callback は合言葉が違えば、Xに問い合わせに戻す', async () => {
    const agent = request.agent(app.getHttpServer());
    await startLogin(agent);

    const res = await agent
      .get('/auth/x/callback?code=fake-code&state=wrong')
      .expect(302);

    expect(res.headers.location).toBe(`${FRONTEND}/?login=failed`);
    expect(fetchUserId).not.toHaveBeenCalled();
    expect(await prisma.account.count()).toBe(0);
  });

  it('GET /auth/x/callback はXに断られたら、つながずに戻す', async () => {
    fetchUserId.mockRejectedValueOnce(new Error('Xに断られた'));
    const agent = request.agent(app.getHttpServer());
    const state = await startLogin(agent);

    const res = await agent
      .get(`/auth/x/callback?code=fake-code&state=${state}`)
      .expect(302);

    expect(res.headers.location).toBe(`${FRONTEND}/?login=failed`);
    expect(await prisma.account.count()).toBe(0);
  });
});
