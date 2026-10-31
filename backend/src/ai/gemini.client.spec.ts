import { Logger } from '@nestjs/common';
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
    config: { systemInstruction: '指示', httpOptions: { timeout: 30_000 } },
  });
});

describe('本命のモデルが答えられないとき', () => {
  beforeEach(() => {
    // .envの値に左右されないよう、モデルの名前はここで決める
    process.env.GEMINI_MODEL = '本命';
    delete process.env.GEMINI_FALLBACK_MODEL;
  });

  it('控えのモデルがあれば控えに頼み、頼んだことをログに残す', async () => {
    process.env.GEMINI_FALLBACK_MODEL = '控え';
    // わざと失敗させるので、ログは画面に出さずに、出したかだけを見る
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
    const generateContent = jest
      .fn()
      .mockRejectedValueOnce(new Error('混んでいます'))
      .mockResolvedValueOnce({ text: '控えの返事' });
    const gemini = new GeminiClient({
      models: { generateContent },
    } as unknown as GoogleGenAI);

    await expect(gemini.chat('指示', [])).resolves.toBe('控えの返事');
    expect(generateContent).toHaveBeenLastCalledWith(
      expect.objectContaining({ model: '控え' }),
    );
    expect(warn).toHaveBeenCalled();
  });

  it('控えのモデルが無ければ、断られたまま返す', async () => {
    const generateContent = jest
      .fn()
      .mockRejectedValue(new Error('混んでいます'));
    const gemini = new GeminiClient({
      models: { generateContent },
    } as unknown as GoogleGenAI);

    await expect(gemini.chat('指示', [])).rejects.toThrow('混んでいます');
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
