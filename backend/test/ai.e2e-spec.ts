import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AI_CLIENT } from '../src/ai/ai-client';

// 本物のAIは呼ばず、決まった返事をする偽物にする
const chat = jest.fn().mockResolvedValue('どう言いたかった？');
const body = {
  diary: '仕事でミスをして落ち込んだ。',
  messages: [{ role: 'user', content: '今日の日記、どう思う？' }],
};

describe('AI(e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AI_CLIENT)
      .useValue({ chat })
      .compile();

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

  // 1回目のアクセスで匿名ユーザを作り、Googleをつないだことにする
  async function googleAgent() {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/me').expect(200);
    const user = await prisma.user.findFirstOrThrow();
    await prisma.account.create({
      data: { provider: 'google', providerAccountId: 'sub-1', userId: user.id },
    });
    return agent;
  }

  it('Googleでログインしていれば、AIの返事が返る', async () => {
    const agent = await googleAgent();
    const res = await agent.post('/ai/chat').send(body).expect(200);
    expect(res.body).toEqual({ reply: 'どう言いたかった？' });
  });

  it('Googleでログインしていなければ、403で断る', async () => {
    await request(app.getHttpServer()).post('/ai/chat').send(body).expect(403);
  });

  it('日記が長すぎたり、会話の形が違ったりしたら、400で断る', async () => {
    const agent = await googleAgent();
    await agent
      .post('/ai/chat')
      .send({ ...body, diary: 'あ'.repeat(8001) })
      .expect(400);
    await agent
      .post('/ai/chat')
      .send({ ...body, messages: [{ role: 'bot', content: 'やあ' }] })
      .expect(400);
  });
});
