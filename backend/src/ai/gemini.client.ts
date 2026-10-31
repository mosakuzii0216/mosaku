import { Logger } from '@nestjs/common';
import type { GoogleGenAI } from '@google/genai';
import type { AiClient, ChatMessage } from './ai-client';

// 1つのモデルを待つのはここまで。混んでいると、答えるまで数分かかることがある
const TIMEOUT_MS = 30_000;

// Gemini(Google)につなぐ差し替え口。Geminiでは、AIの発言を'model'と呼ぶ
export class GeminiClient implements AiClient {
  private readonly logger = new Logger(GeminiClient.name);
  constructor(private readonly genai: GoogleGenAI) {}

  async chat(system: string, messages: ChatMessage[]): Promise<string> {
    const model = process.env.GEMINI_MODEL ?? 'gemini-3.8-flash';
    // 控えのモデル。本命が混んでいて断られたり、遅すぎたりしたら、こちらに頼む
    const fallback = process.env.GEMINI_FALLBACK_MODEL;
    try {
      return await this.ask(model, system, messages);
    } catch (e) {
      if (!fallback) throw e;
      this.logger.warn(
        `${model}が答えられないので、${fallback}に頼みます: ${String(e)}`,
      );
      return await this.ask(fallback, system, messages);
    }
  }

  private async ask(
    model: string,
    system: string,
    messages: ChatMessage[],
  ): Promise<string> {
    const response = await this.genai.models.generateContent({
      model,
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: system,
        httpOptions: { timeout: TIMEOUT_MS },
      },
    });
    return response.text ?? '';
  }
}
