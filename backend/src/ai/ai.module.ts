import { Module } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AI_CLIENT, type AiClient } from './ai-client';
import { FakeClient } from './fake.client';
import { ClaudeClient } from './claude.client';
import { GeminiClient } from './gemini.client';

// どのAIを使うかは、環境変数AI_PROVIDERで選ぶ。書いていなければお試しのAI
function createAiClient(): AiClient {
  switch (process.env.AI_PROVIDER) {
    case 'claude':
      return new ClaudeClient(new Anthropic());
    case 'gemini':
      return new GeminiClient(
        new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
      );
    default:
      return new FakeClient();
  }
}

@Module({
  controllers: [AiController],
  providers: [AiService, { provide: AI_CLIENT, useFactory: createAiClient }],
})
export class AiModule {}
