import { Module } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { PasskeyController } from './passkey.controller';

@Module({
  controllers: [PasskeyController],
  providers: [PasskeyService],
})
export class PasskeyModule {}
