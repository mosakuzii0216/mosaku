import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('目安箱(e2e)', () => {
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
    // 声は人を消しても残るので、別に消す
    await prisma.feedback.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('書いて送ると、送った人と一緒にDBに溜まる', async () => {
    const res = await request(app.getHttpServer())
      .post('/feedback')
      .send({ message: '保存されたか分かりにくい' })
      .expect(201);

    // idはCookieの中身なので、返事には何も入れない
    expect(res.body).toEqual({});
    const feedback = await prisma.feedback.findFirstOrThrow();
    const user = await prisma.user.findFirstOrThrow();
    expect(feedback.message).toBe('保存されたか分かりにくい');
    expect(feedback.userId).toBe(user.id);
  });

  it('空の声や、1000字を超える声は、400で断る', async () => {
    const server = app.getHttpServer();
    await request(server).post('/feedback').send({ message: '' }).expect(400);
    await request(server)
      .post('/feedback')
      .send({ message: 'あ'.repeat(1001) })
      .expect(400);
  });

  it('送った人が消えても、声は残る', async () => {
    await request(app.getHttpServer())
      .post('/feedback')
      .send({ message: 'ありがとう' })
      .expect(201);

    await prisma.user.deleteMany();
    const feedback = await prisma.feedback.findFirstOrThrow();
    expect(feedback.userId).toBeNull();
  });
});
