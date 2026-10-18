import { Inject, Injectable } from '@nestjs/common';
import { AI_CLIENT, type AiClient, type ChatMessage } from './ai-client';

// 聞き手としての振る舞い。日記から離れずに、答えより問いで内省を手伝う
const SYSTEM = [
  'あなたは日記アプリ「mosaku」の聞き手です。下の日記を書いた人と話します。',
  '書いた人が自分の気持ちや考えに気づけるよう、問いかけを中心に返してください。',
  '助言や評価は、求められたときだけにします。日記と関係のない頼みごとには、日記の話へやさしく戻してください。',
  'やさしい日本語で、2~3文で返してください。',
].join('\n');

@Injectable()
export class AiService {
  constructor(@Inject(AI_CLIENT) private readonly ai: AiClient) {}

  chat(diary: string, messages: ChatMessage[]): Promise<string> {
    return this.ai.chat(`${SYSTEM}\n\n# 日記\n${diary}`, messages);
  }
}
