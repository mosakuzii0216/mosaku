import { Module } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AI_CLIENT, type AiClient } from './ai-client';
import { FakeClient } from './fake.client';
import { ClaudeClient } from './claude.client';
import { GeminiClient } from './gemini.client';
import { UserModule } from '../user/user.module';
import { AiUsageService } from './ai-usage.service';
import { UnavailableClient } from './unavailable.client';
import { OpenAiClient } from './openai.client';
import OpenAI from 'openai';

// どのAIを使うかは、環境変数AI_PROVIDERで選ぶ。書いていなければ準備中(503)
export function createAiClient(): AiClient {
  switch (process.env.AI_PROVIDER) {
    case 'fake':
      return new FakeClient();
    case 'claude':
      return new ClaudeClient(new Anthropic());
    case 'gemini':
      return new GeminiClient(
        new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
      );
    case 'openai':
      return new OpenAiClient(new OpenAI());
    default:
      return new UnavailableClient();
  }
}

@Module({
  imports: [UserModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiUsageService,
    { provide: AI_CLIENT, useFactory: createAiClient },
  ],
})
export class AiModule {}
