import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Googleログイン(e2e)', () => {
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
});
