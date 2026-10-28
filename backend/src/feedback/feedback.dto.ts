import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// 目安箱に送られてくる形。ここに書いていない項目は捨てる
export class SendFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000) // 長すぎる声は読みきれないので、1000字まで
  message!: string;
}
