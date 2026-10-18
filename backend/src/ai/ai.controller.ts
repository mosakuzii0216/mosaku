import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // 何かを作るわけではないので、201ではなく200で返す
  @Post('chat')
  @HttpCode(200)
  async chat(@Body() body: ChatDto) {
    return { reply: await this.aiService.chat(body.diary, body.messages) };
  }
}
