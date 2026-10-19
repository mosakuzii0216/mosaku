import type OpenAI from 'openai';
import type { AiClient, ChatMessage } from './ai-client';

// OpenAI(ChatGPT)につなぐ差し替え口
export class OpenAiClient implements AiClient {
  constructor(private readonly openai: OpenAI) {}

  async chat(system: string, messages: ChatMessage[]): Promise<string> {
    const response = await this.openai.responses.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-6.1-sol',
      instructions: system,
      input: messages,
      store: false, // 書かないと、話した中身をOpenAIが30日以上取っておく
    });
    return response.output_text;
  }
}
