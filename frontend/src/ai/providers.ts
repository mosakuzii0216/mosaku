// 話せるAI。名前は、サーバでの呼び方とそろえる
export const AI_PROVIDERS = ["claude", "gemini", "openai"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const AI_LABELS: Record<AiProvider, string> = {
  claude: "Claude",
  gemini: "Gemini",
  openai: "ChatGPT",
};
