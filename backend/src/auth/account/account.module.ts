import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { UserModule } from '../../user/user.module';
import { InvitationModule } from '../../invitation/invitation.module';

// 登録とログインの仕組み。今はGoogleだけが使う
@Module({
  imports: [UserModule, InvitationModule],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
