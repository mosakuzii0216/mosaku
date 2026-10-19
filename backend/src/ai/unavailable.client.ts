import { ServiceUnavailableException } from '@nestjs/common';
import type { AiClient } from './ai-client';

// どのAIを使うか決まっていないときの差し替え口。お試しの返事は出さずに、準備中と断る
export class UnavailableClient implements AiClient {
  chat(): Promise<string> {
    return Promise.reject(
      new ServiceUnavailableException('AIは準備中。もう少し待っててね'),
    );
  }
}
