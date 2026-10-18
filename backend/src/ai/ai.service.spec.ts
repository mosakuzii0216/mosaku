import { Test } from '@nestjs/testing';
import { AiService } from './ai.service';
import { AI_CLIENT, type ChatMessage } from './ai-client';

// 決まった返事をする偽物を差し込んで、AIに何が渡ったかを見る
const chat = jest.fn().mockResolvedValue('その一言、本当はどう言いたかった？');

describe('AiService', () => {
  let service: AiService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [AiService, { provide: AI_CLIENT, useValue: { chat } }],
    }).compile();

    service = module.get(AiService);
  });

  it('日記を指示に入れて、会話はそのままAIに渡す', async () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '今日の日記、どう思う？' },
    ];
    const reply = await service.chat('仕事でミスをして落ち込んだ。', messages);

    expect(reply).toBe('その一言、本当はどう言いたかった？');
    const [system, sent] = chat.mock.calls[0];
    expect(system).toContain('仕事でミスをして');
    expect(sent).toEqual(messages);
  });
});
