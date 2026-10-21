import { useState, type SubmitEvent } from "react";
import { AI_LABELS, type AiProvider } from "./providers";

type Props = {
  providers: readonly AiProvider[];
  onSend: (provider: AiProvider, text: string) => void;
  onClose: () => void;
};

// 日記の横で、AIと話す席。PCでは日記の右に並べて、狭い画面では全体に重ねる
export function AiPane({ providers, onSend, onClose }: Props) {
  const [provider, setProvider] = useState(providers[0]);
  const [draft, setDraft] = useState("");
  // 選べるAIが無い間は、話しかける欄を出さずに準備中と伝える
  const isReady = providers.length > 0;

  // 送ってもページは読み直さない。送ったら欄を空に戻す。
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSend(provider, draft.trim());
    setDraft("");
  };

  return (
    <aside className="ai-pane" aria-label="AIと話す">
      {/* 見出しの並びは、メモ一覧の引き出しとそろえる */}
      <div className="drawer-head">
        <h2>AIと話す</h2>
        <button
          className="ghost-button drawer-close"
          aria-label="AIとの会話を閉じる"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
      <p className="ai-empty">
        {isReady
          ? "書いた日記について、AIと話せます"
          : "AIは準備中。もう少し待っててね"}
      </p>

      <form className="ai-form" onSubmit={handleSubmit} hidden={!isReady}>
        <textarea
          className="ai-input"
          aria-label="AIに話しかける"
          placeholder="AIに話しかける"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        {/* 話す相手。送るたびに選び直せる */}
        <select
          className="ghost-button"
          aria-label="話すAI"
          value={provider}
          onChange={(e) => setProvider(e.target.value as AiProvider)}
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {AI_LABELS[p]}
            </option>
          ))}
        </select>
        <button className="ghost-button ai-send" disabled={!draft.trim()}>
          送る
        </button>
      </form>
    </aside>
  );
}
