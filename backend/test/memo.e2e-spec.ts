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
    await prisma.user.create({ data: { id: 'user-1' } });
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /memos でメモを作れる', async () => {
    const res = await request(app.getHttpServer())
      .post('/memos')
      .send({ title: 'テスト', content: { type: 'doc', content: [] } })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('テスト');
  });

  it('GET /memos で一覧が取れる', async () => {
    await request(app.getHttpServer())
      .post('/memos')
      .send({ title: 'テスト', content: { type: 'doc', content: [] } })
      .expect(201);

    const res = await request(app.getHttpServer()).get('/memos').expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('テスト');
  });
});
