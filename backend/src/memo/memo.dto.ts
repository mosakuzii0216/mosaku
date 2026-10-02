import { IsObject, IsString, MaxLength } from 'class-validator';
import type { Prisma } from '../../generated/prisma/client';

// メモを作る・更新するときに受け取る形。ここに書いていない項目は捨てる
export class saveMemoDto {
  @IsString()
  @MaxLength(100) // VarChar(100)
  title!: string;

  @IsObject()
  content!: Prisma.InputJsonObject;
}
