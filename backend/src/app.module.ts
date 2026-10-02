import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MemoModule } from './memo/memo.module';
import { UserModule } from './user/user.module';
import { PasskeyModule } from './auth/passkey/passkey.module';
import { MemoController } from './memo/memo.controller';
import { PasskeyController } from './auth/passkey/passkey.controller';
import { UserController } from './user/user.controller';
import { AnonymousUserMiddleware } from './auth/anonymous-user.middleware';

@Module({
  imports: [PrismaModule, MemoModule, UserModule, PasskeyModule],
  controllers: [AppController],
  providers: [
    AppService,
    // 全部の入り口で、DTOに合わない入力を400で断る(ここに置くとe2eでも効く)
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(process.env.COOKIE_SECRET), AnonymousUserMiddleware)
      .forRoutes(MemoController, PasskeyController, UserController);
  }
}
