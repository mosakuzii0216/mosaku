import { Module } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AI_CLIENTS, type AiClient } from './ai-client';
import { FakeClient } from './fake.client';
import { ClaudeClient } from './claude.client';
import { GeminiClient } from './gemini.client';
import { UserModule } from '../user/user.module';
import { AiUsageService } from './ai-usage.service';
import { OpenAiClient } from './openai.client';
import OpenAI from 'openai';

// 名前からAIを作る。知らない名前なら、書き間違いに気づけるよう起動を止める
function createAiClient(name: string): AiClient {
  switch (name) {
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
      throw new Error(`AI_PROVIDERSに知らない名前があります: ${name}`);
  }
}

// 選べるAIは、環境変数AI_PROVIDERSにカンマ区切りで書く。書かなければ、どれも選べない
export function createAiClients(): Map<string, AiClient> {
  const names = (process.env.AI_PROVIDERS ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== '');
  return new Map(names.map((name) => [name, createAiClient(name)]));
}

@Module({
  imports: [UserModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiUsageService,
    { provide: AI_CLIENTS, useFactory: createAiClients },
  ],
})
export class AiModule {}
