import { ServiceUnavailableException } from '@nestjs/common';
import { createAiClient } from './ai.module';
import { FakeClient } from './fake.client';
import { create } from 'domain';

// backend/.envに書いた値に左右されないよう、AI_PROVIDERはテストの中で決める
it('AI_PROVIDERがfakeなら、お試しのAIを使う', () => {
  process.env.AI_PROVIDER = 'fake';

  expect(createAiClient()).toBeInstanceOf(FakeClient);
});

it('AI_PROVIDERを書いていなければ、準備中(503)と断る', async () => {
  delete process.env.AI_PROVIDER;

  await expect(createAiClient().chat('指示', [])).rejects.toThrow(
    ServiceUnavailableException,
  );
});
