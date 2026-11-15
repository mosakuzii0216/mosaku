import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { UserModule } from '../../user/user.module';
import { InvitationModule } from '../../invitation/invitation.module';

// GoogleとXで共有する、登録とログインの仕組み
@Module({
  imports: [UserModule, InvitationModule],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
