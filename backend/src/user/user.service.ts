import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // IDが無い、またはそのIDのユーザがDBに居ない場合は、新しく1件作って返す
  async findOrCreate(userId?: string): Promise<User> {
    if (userId) {
      const found = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (found) return found;
    }
    return this.prisma.user.create({ data: {} });
  }
}
