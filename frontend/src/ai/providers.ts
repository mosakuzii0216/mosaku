// 話せるAI。名前は、サーバでの呼び方とそろえる。fakeは、お金のかからないお試し
export const AI_PROVIDERS = ["fake", "claude", "gemini", "openai"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const AI_LABELS: Record<AiProvider, string> = {
  fake: "お試し",
  claude: "Claude",
  gemini: "Gemini",
  openai: "ChatGPT",
};
