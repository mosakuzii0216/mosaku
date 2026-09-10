import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MemoModule } from './memo/memo.module';
import { UserModule } from './user/user.module';
import { MemoController } from './memo/memo.controller';
import { AnonymousUserMiddleware } from './auth/anonymous-user.middleware';

@Module({
  imports: [PrismaModule, MemoModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(), AnonymousUserMiddleware)
      .forRoutes(MemoController);
  }
}
