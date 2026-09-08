import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MemoModule } from './memo/memo.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, MemoModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
