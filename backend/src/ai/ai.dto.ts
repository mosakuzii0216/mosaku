import { IsArray, IsString } from 'class-validator';
import type { ChatMessage } from './ai-client';

// 日記について話すときに受け取る形。会話はサーバーで覚えないので、毎回全部送ってもらう
export class ChatDto {
  @IsString()
  diary!: string;

  @IsArray()
  messages!: ChatMessage[];
}
