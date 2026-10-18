import type { GoogleGenAI } from '@google/genai';
import type { AiClient, ChatMessage } from './ai-client';

// Gemini(Google)につなぐ差し替え口。Geminiでは、AIの発言を'model'と呼ぶ
export class GeminiClient implements AiClient {
  constructor(private readonly genai: GoogleGenAI) {}

  async chat(system: string, messages: ChatMessage[]): Promise<string> {
    const response = await this.genai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? 'gemini-3.8-flash',
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      config: { systemInstruction: system },
    });
    return response.text ?? '';
  }
}
