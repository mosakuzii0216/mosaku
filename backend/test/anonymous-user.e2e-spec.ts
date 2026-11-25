import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('匿名ユーザ (e2e)', () => {
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

  it('初めての相手にはCookieを発行する', async () => {
    const res = await request(app.getHttpServer()).get('/me').expect(200);

    expect(res.headers['set-cookie']).toBeDefined();
  });

  // /meは、名札の期限を延ばすために毎回付け直すので、他の入り口で確かめる
  it('有効なCookieを持つ相手には、Cookieを発行し直さない', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/memos').expect(200);

    const res = await agent.get('/memos').expect(200);

    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('DBにもう居ないユーザのCookieには、新しく発行し直す', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/me').expect(200);
    await prisma.user.deleteMany();

    const res = await agent.get('/me').expect(200);

    expect(res.headers['set-cookie']).toBeDefined();
  });
});
