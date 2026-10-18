import type Anthropic from '@anthropic-ai/sdk';
import { ClaudeClient } from './claude.client';

it('Claudeの返事から、文章の塊だけを取り出す', async () => {
  const create = jest.fn().mockResolvedValue({
    content: [
      { type: 'thinking', thinking: '考え中' },
      { type: 'text', text: 'どう言いたかった？' },
    ],
  });
  const claude = new ClaudeClient({
    messages: { create },
  } as unknown as Anthropic);

  const reply = await claude.chat('指示', [
    { role: 'user', content: 'こんにちは' },
  ]);

  expect(reply).toBe('どう言いたかった？');
  // 指示はsystemに、会話はmessagesにそのまま入る
  expect(create.mock.calls[0][0]).toMatchObject({
    system: '指示',
    messages: [{ role: 'user', content: 'こんにちは' }],
  });
});
