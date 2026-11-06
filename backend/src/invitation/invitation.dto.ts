import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// 打ったコードを確かめるときの形。ここに書いていない項目は捨てる
export class CheckInvitationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20) // 8文字に、ハイフンや空白が混じっても収まる長さ
  code!: string;
}
