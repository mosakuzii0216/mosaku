import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

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
    expect(res.body).toEqual({ hasPasskey: false, hasGoogle: false });
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

    expect(res.body).toEqual({ hasPasskey: true, hasGoogle: false });
  });

  it('GET /me はGoogleと連携したユーザにhasGoogle: trueを返す', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/me').expect(200);
    const user = await prisma.user.findFirstOrThrow();
    await prisma.account.create({
      data: { provider: 'google', providerAccountId: 'sub-1', userId: user.id },
    });

    const res = await agent.get('/me').expect(200);

    expect(res.body).toEqual({ hasPasskey: false, hasGoogle: true });
  });
});
