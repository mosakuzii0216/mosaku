import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 1人が1日(直近24時間)に話せる回数。環境変数AI_DAILY_LIMITで変えられる
const DAILY_LIMIT = 20;
// みんな合わせて1日に話せる回数。お財布を守る。環境変数AI_TOTAL_DAILY_LIMITで変えられる
const TOTAL_DAILY_LIMIT = 200;

@Injectable()
export class AiUsageService {
  constructor(private readonly prisma: PrismaService) {}

  // 1回分を使う。直近24時間の回数が上限に届いていたら断る(1人分は429、みんなの分は503)
  async consume(userId: string): Promise<void> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const used = await this.prisma.aiUsage.count({
      where: { userId, createdAt: { gte: since } },
    });
    if (used >= Number(process.env.AI_DAILY_LIMIT ?? DAILY_LIMIT)) {
      throw new HttpException(
        '今日はここまでです。また明日お話ししましょう',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const total = await this.prisma.aiUsage.count({
      where: { createdAt: { gte: since } },
    });
    if (
      total >= Number(process.env.AI_TOTAL_DAILY_LIMIT ?? TOTAL_DAILY_LIMIT)
    ) {
      throw new ServiceUnavailableException(
        '今日はみんなとたくさん話したので、AIは一休みしています。また明日お話ししましょう。',
      );
    }
    await this.prisma.aiUsage.create({ data: { userId } });
  }
}
