import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { AI_LABELS, type AiProvider } from "./providers";
import { MAX_CONTENT, type ChatMessage } from "./aiApi";
import { MOD } from "../shortcut";

type Props = {
  providers: readonly AiProvider[];
  isWaiting: boolean;
  error: string;
  messages: ChatMessage[];
  onSend: (provider: AiProvider, text: string) => void;
  onClose: () => void;
};

// 日記の横で、AIと話す席。PCでは日記の右に並べて、狭い画面では全体に重ねる
export function AiPane({
  providers,
  messages,
  isWaiting,
  error,
  onSend,
  onClose,
}: Props) {
  const [provider, setProvider] = useState(providers[0]);
  const [draft, setDraft] = useState("");
  // 選べるAIが無い間は、話しかける欄を出さずに準備中と伝える
  const isReady = providers.length > 0;
  // 書いてあって、返事を待っていないときだけ送れる
  const canSend = draft.trim() !== "" && !isWaiting;
  // 新しい言葉が出たら、会話をいちばん下まで動かす
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isWaiting]);

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
      <p className="ai-empty" hidden={messages.length > 0}>
        {isReady
          ? "書いた日記について、AIと話せます"
          : "AIは準備中です。もう少しお待ちください"}
      </p>
      {/* 話したことと返事。並びは増えるだけで入れ替わらないので、keyは番号でいい */}
      {messages.length > 0 && (
        <ol className="ai-log" aria-label="AIとの会話" ref={logRef}>
          {messages.map((m, i) => (
            <li key={i} className={`ai-${m.role}`}>
              {m.content}
            </li>
          ))}
          {isWaiting && <li className="ai-waiting">考え中...</li>}
        </ol>
      )}
      {/* 断られたときの理由。話しかける欄のすぐ上に出す */}
      {error && (
        <p className="ai-error" role="alert">
          {error}
        </p>
      )}

      <form className="ai-form" onSubmit={handleSubmit} hidden={!isReady}>
        <textarea
          className="ai-input"
          aria-label="AIに話しかける"
          placeholder="AIに話しかける"
          maxLength={MAX_CONTENT}
          // マウスのある画面では、開いたらすぐ書ける。スマホでは急にキーボードを出さない
          autoFocus={matchMedia("(hover: hover)").matches}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          // ⌘Enter(WindowsはCtrl+Enter)で送る。Enterだけなら改行
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              if (canSend) e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        {/* 話す相手。送るたびに選び直せる。1つしか無ければ、迷わないように見せない */}
        <select
          className="ghost-button"
          hidden={providers.length < 2}
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
        {/* 返事を待つ間は、次を書いておけるけど、送れない */}
        <button className="ghost-button ai-send" disabled={!canSend}>
          送る
          {/* マウスを乗せたら、キーでも送れることを見せる。読み上げでは名前に混ぜない */}
          <kbd className="ai-shortcut" aria-hidden="true">
            {MOD} Enter
          </kbd>
        </button>
      </form>
      {/* Geminiの無料枠では、送ったものをGoogleが使う。話しかける前に読めるよう、欄の下に置く */}
      {provider === "gemini" && (
        <p className="ai-note">
          話しかけると、開いている日記と会話がGoogleに送られます。GoogleはAIの改善に使い、人が読むこともあります
        </p>
      )}
    </aside>
  );
}
