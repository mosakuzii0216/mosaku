import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ChatMessageDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty() // 空のメッセージはAIの側で断られる
  @MaxLength(2000)
  content!: string;
}

// 日記について話すときに受け取る形。会話はサーバーで覚えないので、毎回全部送ってもらう
export class ChatDto {
  @IsString() // 話すAIの名前。AI_PROVIDERSに書いたもの
  provider!: string;

  @IsString()
  @MaxLength(8000) // 長い日記ほどお金がかかるので、上限を決めておく
  diary!: string;

  @ArrayMinSize(1)
  @ArrayMaxSize(20) // 会話は直近の20通まで
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];
}
