import { Module } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { GoogleController } from './google.controller';
import { GOOGLE_OAUTH_CLIENT } from './google.constants';

@Module({
  controllers: [GoogleController],
  providers: [
    {
      provide: GOOGLE_OAUTH_CLIENT,
      // 値が未設定でもアプリは起動できるようにする(テストやCIのため)
      useFactory: () =>
        new OAuth2Client(
          process.env.GOOGLE_CLIENT_ID ?? 'not-configured',
          process.env.GOOGLE_CLIENT_SECRET ?? 'not-configured',
          process.env.GOOGLE_REDIRECT_URI ??
            'http://localhost:3000/auth/google/callback',
        ),
    },
  ],
})
export class GoogleModule {}
