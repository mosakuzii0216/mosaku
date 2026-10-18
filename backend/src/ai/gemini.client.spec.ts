import type { GoogleGenAI } from '@google/genai';
import { GeminiClient } from './gemini.client';

it('会話をGeminiの形に直して渡し、返事の文章を返す', async () => {
  const generateContent = jest
    .fn()
    .mockResolvedValue({ text: 'どう言いたかった？' });
  const gemini = new GeminiClient({
    models: { generateContent },
  } as unknown as GoogleGenAI);

  const reply = await gemini.chat('指示', [
    { role: 'user', content: 'こんにちは' },
    { role: 'assistant', content: 'やあ' },
  ]);

  expect(reply).toBe('どう言いたかった？');
  // AIの発言はroleが'model'になり、指示はsystemInstructionに入る
  expect(generateContent.mock.calls[0][0]).toMatchObject({
    contents: [
      { role: 'user', parts: [{ text: 'こんにちは' }] },
      { role: 'model', parts: [{ text: 'やあ' }] },
    ],
    config: { systemInstruction: '指示' },
  });
});
