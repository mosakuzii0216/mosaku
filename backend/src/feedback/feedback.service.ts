import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async send(userId: string, message: string): Promise<void> {
    await this.prisma.feedback.create({ data: { userId, message } });
  }
}
