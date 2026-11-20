import { Module } from '@nestjs/common';
import { XController } from './x.controller';
import { XClient } from './x.client';
import { xRedirectUri } from './x.constants';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [AccountModule],
  controllers: [XController],
  providers: [
    {
      provide: XClient,
      // 値が未設定でもアプリは起動できるようにする(テストやCIのため)
      useFactory: () =>
        new XClient(
          process.env.X_CLIENT_ID ?? 'not-configured',
          process.env.X_CLIENT_SECRET ?? 'not-configured',
          xRedirectUri(),
        ),
    },
  ],
})
export class XModule {}
