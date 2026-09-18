import { Module } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { PasskeyController } from './passkey.controller';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [PasskeyController],
  providers: [PasskeyService],
})
export class PasskeyModule {}
