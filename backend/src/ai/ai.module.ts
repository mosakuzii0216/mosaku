import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AI_CLIENT } from './ai-client';
import { FakeClient } from './fake.client';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    // 今はお試しのAI。ClaudeとGeminiは22-2で足して、環境変数で選べるようにする
    { provide: AI_CLIENT, useFactory: () => new FakeClient() },
  ],
})
export class AiModule {}
