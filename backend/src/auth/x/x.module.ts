import { Module } from '@nestjs/common';
import { XController } from './x.controller';

@Module({
  controllers: [XController],
})
export class XModule {}
