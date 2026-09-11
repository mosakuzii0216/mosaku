import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Memo (e2e)', () => {
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

  it('POST /memos でメモを作れる', async () => {
    const agent = request.agent(app.getHttpServer());

    const res = await agent
      .post('/memos')
      .send({ title: 'テスト', content: { type: 'doc', content: [] } })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('テスト');
  });

  it('GET /memos で一覧が取れる', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/memos')
      .send({ title: 'テスト', content: { type: 'doc', content: [] } })
      .expect(201);

    const res = await agent.get('/memos').expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('テスト');
  });

  it('別のブラウザのメモは見えない', async () => {
    const alice = request.agent(app.getHttpServer());
    const bob = request.agent(app.getHttpServer());

    await alice
      .post('/memos')
      .send({ title: 'アタシのメモ', content: { type: 'doc', content: [] } })
      .expect(201);

    await bob
      .post('/memos')
      .send({ title: '他人のメモ', content: { type: 'doc', content: [] } })
      .expect(201);

    const res = await alice.get('/memos').expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('アタシのメモ');
  });

  it('他人のメモはPATCHで更新できない', async () => {
    const alice = request.agent(app.getHttpServer());
    const bob = request.agent(app.getHttpServer());

    const created = await alice
      .post('/memos')
      .send({ title: 'アタシのメモ', content: { type: 'doc', content: [] } })
      .expect(201);

    await bob
      .patch(`/memos/${created.body.id}`)
      .send({ title: '乗っ取り', content: { type: 'doc', content: [] } })
      .expect(404);
  });
});
