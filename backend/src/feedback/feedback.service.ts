import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  constructor(private readonly prisma: PrismaService) {}

  async send(userId: string, message: string): Promise<void> {
    await this.prisma.feedback.create({ data: { userId, message } });
    // Slackに知らせる合図。Cloud Monitoringがこの1行を拾う(ops/alerts/feedback.yaml)
    // 改行があるとログが分かれるので、空白にして1行にする
    this.logger.log(`目安箱に新しい声「${message.replaceAll('\n', ' ')}」`);
  }
}
