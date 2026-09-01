import { Module } from '@nestjs/common';
import { MemoService } from './memo.service';

@Module({
  providers: [MemoService],
})
export class MemoModule {}
