// 会話の1通。user=日記を書いた人、assistant=AI
export type ChatMessage = { role: 'user' | 'assistant'; content: string };

// AIの会社ごとの違いは、この形の後ろに閉じ込める(差し替え口)
export interface AiClient {
  chat(system: string, messages: ChatMessage[]): Promise<string>;
}

// どのAIを使うかは、この名前で渡す。テストでは偽物に差し替える
export const AI_CLIENT = 'AI_CLIENT';
