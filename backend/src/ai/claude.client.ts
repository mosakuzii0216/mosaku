import type Anthropic from '@anthropic-ai/sdk';
import type { AiClient, ChatMessage } from './ai-client';

// Claude(Anthropic)につなぐ差し替え口
export class ClaudeClient implements AiClient {
  constructor(private readonly anthropic: Anthropic) {}

  async chat(system: string, messages: ChatMessage[]): Promise<string> {
    const message = await this.anthropic.messages.create({
      model: process.env.CLAUDE_MODEL ?? 'claude-opus-5-5',
      max_tokens: 2048, // 考える分も含めた上限。返事は短いので、実際はずっと少ない
      system,
      messages,
    });
    // 返ってきた塊(考えた跡など)の中から、文章(text)の塊を取り出す
    const block = message.content.find((b) => b.type === 'text');
    return block?.text ?? '';
  }
}
