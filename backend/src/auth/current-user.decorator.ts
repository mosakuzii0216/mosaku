import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 認証を入れるまでの仮実装。差し替えるのはこの関数の中だけ
const TEMP_USER_ID = 'user-1';

export const CurrentUser = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext): { id: string } => {
    return { id: TEMP_USER_ID };
  },
);
