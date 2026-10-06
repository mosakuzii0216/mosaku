import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OAuth2Client } from 'google-auth-library';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { GOOGLE_OAUTH_CLIENT } from '../src/auth/google/google.constants';

const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// 本物のクライアントを使い、Googleに問い合わせる2つだけを偽物にする
const client = new OAuth2Client(
  'test-client-id',
  'test-client-secret',
  'http://localhost:3000/auth/google/callback',
);
const getToken = jest
  .spyOn(client, 'getToken')
  .mockResolvedValue({ tokens: { id_token: 'fake-id-token' } } as never);
const verifyIdToken = jest.spyOn(client, 'verifyIdToken').mockResolvedValue({
  getPayload: () => ({ sub: 'google-sub-1', email: 'a@example.com' }),
} as never);

describe('Googleログイン (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GOOGLE_OAUTH_CLIENT)
      .useValue(client)
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

  // 匿名の名札をもらってからstartを通り、Googleへ渡すはずだった合言葉を取り出す
  async function startLogin(agent: ReturnType<typeof request.agent>) {
    await agent.get('/me').expect(200);
    const res = await agent.get('/auth/google/start').expect(302);
    return new URL(res.headers.location).searchParams.get('state');
  }

  it('GET /auth/google/start はPKCE付きでGoogleのログイン画面へ送る', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/google/start')
      .expect(302);

    const url = new URL(res.headers.location);
    expect(url.origin).toBe('https://accounts.google.com');
    expect(url.searchParams.get('state')).toBeTruthy();
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
  });

  it('GET /auth/google/start は合言葉と鍵をCookieに預ける', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/google/start')
      .expect(302);

    const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
    expect(cookies.some((c) => c.startsWith('mosaku_google_state='))).toBe(
      true,
    );
    expect(cookies.some((c) => c.startsWith('mosaku_google_verifier='))).toBe(
      true,
    );
  });

  it('GET /auth/google/callback は合言葉が合えば、Googleの人をつないで画面へ戻す', async () => {
    const agent = request.agent(app.getHttpServer());
    const state = await startLogin(agent);

    const res = await agent
      .get(`/auth/google/callback?code=fake-code&state=${state}`)
      .expect(302);

    expect(res.headers.location).toBe(FRONTEND);
    expect(getToken).toHaveBeenCalledWith({
      code: 'fake-code',
      codeVerifier: expect.any(String),
    });
    const user = await prisma.user.findFirstOrThrow();
    const account = await prisma.account.findFirstOrThrow();
    expect(account.userId).toBe(user.id);
    expect(account.providerAccountId).toBe('google-sub-1');
    expect(account.email).toBe('a@example.com');
  });

  it('GET /auth/google/callback は合言葉が違えば、Googleに問い合わせずに戻す', async () => {
    const agent = request.agent(app.getHttpServer());
    await startLogin(agent);

    const res = await agent
      .get('/auth/google/callback?code=fake-code&state=wrong')
      .expect(302);

    expect(res.headers.location).toBe(`${FRONTEND}/?login=failed`);
    expect(getToken).not.toHaveBeenCalled();
    expect(await prisma.account.count()).toBe(0);
  });

  it('GET /auth/google/callback は証明書が確かめられなければ、つながずに戻す', async () => {
    verifyIdToken.mockRejectedValueOnce(new Error('署名が合わない') as never);
    const agent = request.agent(app.getHttpServer());
    const state = await startLogin(agent);

    const res = await agent
      .get(`/auth/google/callback?code=fake-code&state=${state}`)
      .expect(302);

    expect(res.headers.location).toBe(`${FRONTEND}/?login=failed`);
    expect(await prisma.account.count()).toBe(0);
  });
});
