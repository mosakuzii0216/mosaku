import {
  BadGatewayException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AI_CLIENTS, type AiClient, type ChatMessage } from './ai-client';
import { UnavailableClient } from './unavailable.client';

// 聞き手としての振る舞い。日記から離れずに、答えより問いで内省を手伝う
const SYSTEM = [
  'あなたは日記アプリ「mosaku」の聞き手です。下の日記を書いた人と話します。',
  '書いた人が自分の気持ちや考えに気づけるよう、問いかけを中心に返してください。',
  '助言や評価は、求められたときだけにします。日記と関係のない頼みごとには、日記の話へやさしく戻してください。',
  'やわらかく落ち着いた敬語(です・ます)で返してください',
].join('\n');

// AIが答えられなかったときに画面に出す言葉
const NO_REPLY =
  'AIが答えられませんでした。少し待って、もう一度話しかけてください';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  constructor(
    @Inject(AI_CLIENTS) private readonly clients: Map<string, AiClient>,
  ) {}

  // 選べるAIの名前。AI_PROVIDERSに書いた順に並ぶ
  providers(): string[] {
    return [...this.clients.keys()];
  }

  async chat(
    provider: string,
    diary: string,
    messages: ChatMessage[],
  ): Promise<string> {
    // 選べないAIなら、準備中(503)と断る
    const ai = this.clients.get(provider) ?? new UnavailableClient();
    let reply: string;
    try {
      reply = await ai.chat(`${SYSTEM}\n\n# 日記\n${diary}`, messages);
    } catch (e) {
      // 準備中(503)のように、返し方が決まっているものはそのまま返す
      if (e instanceof HttpException) throw e;
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
