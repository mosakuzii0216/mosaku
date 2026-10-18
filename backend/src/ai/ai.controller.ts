import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './ai.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserService } from '../user/user.service';
import { AiUsageService } from './ai-usage.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly userService: UserService,
    private readonly aiUsage: AiUsageService,
  ) {}

  // 何かを作るわけではないので、201ではなく200で返す
  @Post('chat')
  @HttpCode(200)
  async chat(@CurrentUser() user: { id: string }, @Body() body: ChatDto) {
    // AIはGoogleでログインした人だけ。使った回数を人に結びつけるため
    if (!(await this.userService.hasGoogle(user.id))) {
      throw new ForbiddenException('AIはGoogleでログインすると使えます');
    }
    await this.aiUsage.consume(user.id);
    return { reply: await this.aiService.chat(body.diary, body.messages) };
  }
}
