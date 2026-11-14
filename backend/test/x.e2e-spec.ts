import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Xでログイン(e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

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
});
