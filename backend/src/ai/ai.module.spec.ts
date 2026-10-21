import { createAiClients } from './ai.module';
import { FakeClient } from './fake.client';

// backend/.envに書いた値に左右されないよう、AI_PROVIDERSはテストの中で決める
// 本物のAIは作らない。キーが無いと、CLaudeはテストが終わった後に鍵を探しに行って落ちる
it('AI_PROVIDERSに書いたaiを、選べるようにする', () => {
  process.env.AI_PROVIDERS = 'fake';

  expect(createAiClients().get('fake')).toBeInstanceOf(FakeClient);
});

it('AI_PROVIDERSを書いていなければ、どのAIも選べない', () => {
  delete process.env.AI_PROVIDERS;

  expect(createAiClients().size).toBe(0);
});

it('知らない名前が書いてあれば、その名前を出して起動を止める', () => {
  process.env.AI_PROVIDERS = 'fake, cluade';

  expect(() => createAiClients()).toThrow('知らない名前があります: cluade');
});
