import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('招待コード(e2e)', () => {
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

  // 1回目のアクセスで匿名ユーザを作り、開発者の印を付ける
  async function developerAgent() {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/me').expect(200);
    await prisma.user.updateMany({ data: { isDeveloper: true } });
    return agent;
  }

  it('作ったコードは4-4の形で返り、一覧に「まだ」で並ぶ', async () => {
    const agent = await developerAgent();
    const created = await agent.post('/invitations').expect(201);
    expect(created.body.code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    const res = await agent.get('/invitations').expect(200);
    // 作った人のIDなど、余計なものが混ざっていないことも確かめる
    expect(res.body).toEqual({
      invitations: [{ ...created.body, status: 'unused' }],
      remaining: null,
    });
  });

  it('プレミアムでなければ、作れずに403で断る', async () => {
    await request(app.getHttpServer()).post('/invitations').expect(403);
  });

  it('取り消すと「取り消し」になる。人のコードは取り消せない', async () => {
    const alice = await developerAgent();
    const created = await alice.post('/invitations').expect(201);
    const bob = request.agent(app.getHttpServer());

    await bob.post(`/invitations/${created.body.id}/revoke`).expect(404);
    await alice.post(`/invitations/${created.body.id}/revoke`).expect(204);
    const res = await alice.get('/invitations').expect(200);
    expect(res.body.invitations[0].status).toBe('revoked');
  });

  it('打ったコードを確かめると、使えるならnull、使えなければ理由が返る', async () => {
    const agent = await developerAgent();
    const created = await agent.post('/invitations').expect(201);

    const ok = await agent
      .post('/invitations/check')
      .send({ code: created.body.code })
      .expect(200);
    expect(ok.body).toEqual({ reason: null });
    const ng = await agent
      .post('/invitations/check')
      .send({ code: 'EEEE-EEEE' })
      .expect(200);
    expect(ng.body).toEqual({ reason: 'not_found' });
    // 何も打っていなければ、400で断る
    await agent.post('/invitations/check').send({ code: '' }).expect(400);
  });
});
