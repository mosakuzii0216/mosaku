import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { SendFeedbackDto } from './feedback.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // ログインしていなくても送れる。ログインで困った人の声こそ聞きたいから
  // 返事は空。idはCookieの中身なので、画面に渡さない
  @Post()
  send(@CurrentUser() user: { id: string }, @Body() body: SendFeedbackDto) {
    return this.feedbackService.send(user.id, body.message);
  }
}
