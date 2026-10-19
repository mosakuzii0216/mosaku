import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 1人が1日(直近24時間)に話せる回数。環境変数AI_DAILY_LIMITで変えられる
const DAILY_LIMIT = 20;

@Injectable()
export class AiUsageService {
  constructor(private readonly prisma: PrismaService) {}

  // 1回分を使う。直近24時間に話した回数が上限に届いていたら、429で断る
  async consume(userId: string): Promise<void> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const used = await this.prisma.aiUsage.count({
      where: { userId, createdAt: { gte: since } },
    });
    if (used >= Number(process.env.AI_DAILY_LIMIT ?? DAILY_LIMIT)) {
      throw new HttpException(
        '今日はここまで。また明日話そうね',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.prisma.aiUsage.create({ data: { userId } });
  }
}
