import type OpenAI from 'openai';
import { OpenAiClient } from './openai.client';

it('指示と会話をOpenAIを渡して、返事の文章を返す', async () => {
  const create = jest
    .fn()
    .mockResolvedValue({ output_text: 'どう言いたかった？' });
  const openai = new OpenAiClient({
    responses: { create },
  } as unknown as OpenAI);

  const reply = await openai.chat('指示', [
    { role: 'user', content: 'こんにちは' },
  ]);

  expect(reply).toBe('どう言いたかった？');
  // 指示はinstructionsに、会話はinputにそのまま入る。日記はOpenAI側に残さない。
  expect(create.mock.calls[0][0]).toMatchObject({
    instructions: '指示',
    input: [{ role: 'user', content: 'こんにちは' }],
    store: false,
  });
});
