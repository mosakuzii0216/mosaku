import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AI_CLIENTS } from '../src/ai/ai-client';

// 本物のAIは呼ばず、決まった返事をする偽物にする
const chat = jest.fn().mockResolvedValue('どう言いたかった？');
const body = {
  provider: 'fake',
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
      .overrideProvider(AI_CLIENTS)
      .useValue(new Map([['fake', { chat }]]))
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
    process.env.AI_DAILY_LIMIT = '1';
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    delete process.env.AI_DAILY_LIMIT;
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

  it('1日に話せる回数を使い切ったら、429で断る', async () => {
    const agent = await googleAgent();
    await agent.post('/ai/chat').send(body).expect(200);
    await agent.post('/ai/chat').send(body).expect(429);
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

  it('選べるAIの名前は、ログインしていなくても見られる', async () => {
    const res = await request(app.getHttpServer())
      .get('/ai/providers')
      .expect(200);
    expect(res.body).toEqual({ providers: ['fake'] });
  });

  it('選べるAIを見ても、ユーザは増えない', async () => {
    await request(app.getHttpServer()).get('/ai/providers').expect(200);
    // 見るだけで匿名ユーザを作ると、ページを開くたびに空のユーザが増える
    expect(await prisma.user.count()).toBe(0);
  });
});
