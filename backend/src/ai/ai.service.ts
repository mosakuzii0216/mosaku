import {
  BadGatewayException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AI_CLIENT, type AiClient, type ChatMessage } from './ai-client';

// 聞き手としての振る舞い。日記から離れずに、答えより問いで内省を手伝う
const SYSTEM = [
  'あなたは日記アプリ「mosaku」の聞き手です。下の日記を書いた人と話します。',
  '書いた人が自分の気持ちや考えに気づけるよう、問いかけを中心に返してください。',
  '助言や評価は、求められたときだけにします。日記と関係のない頼みごとには、日記の話へやさしく戻してください。',
  'やさしい日本語で、2〜3文で返してください。',
].join('\n');

// AIが答えられなかったときに画面に出す言葉
const NO_REPLY = 'AIが答えられなかった。少し待って、もう一度話しかけてね';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  constructor(@Inject(AI_CLIENT) private readonly ai: AiClient) {}

  async chat(diary: string, messages: ChatMessage[]): Promise<string> {
    let reply: string;
    try {
      reply = await this.ai.chat(`${SYSTEM}\n\n# 日記\n${diary}`, messages);
    } catch (e) {
      // つながらない・混んでいる・キーが違う、など。理由はログにだけ残す
      this.logger.error(e);
      throw new BadGatewayException(NO_REPLY);
    }
    // AIに断られたときは、返事が空で返ってくる
    if (!reply.trim()) {
      throw new BadGatewayException(NO_REPLY);
    }
    return reply;
  }
}
