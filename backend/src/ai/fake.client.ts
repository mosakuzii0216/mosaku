import type { AiClient, ChatMessage } from './ai-client';

// お金をかけずに流れや画面が確かめるための、お試しのAI。本物のAIは呼ばない
export class FakeClient implements AiClient {
  chat(_system: string, messages: ChatMessage[]): Promise<string> {
    const last = messages[messages.length - 1]?.content ?? '';
    return Promise.resolve(
      `(お試しの返事)「${last}」について、もう少し聞かせて？`,
    );
  }
}
