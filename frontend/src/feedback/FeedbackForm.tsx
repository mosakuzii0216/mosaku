import { useState, type SubmitEvent } from "react";

type Props = {
  onSend: (message: string) => Promise<void>;
};

// 設定の中の目安箱。書いた声は、開発者にだけ届く
export function FeedbackForm({ onSend }: Props) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState("");
  // 空白だけの声は送らない。送っている間は、もう一度押せない
  const canSend = draft.trim() !== "" && !isSending;

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSend(draft.trim());
      setDraft("");
      setNotice("届きました。ありがとうございます");
    } catch {
      // 届かなかったら、書いたものは消さずに残す
      setNotice("うまく届きませんでした。少し待って、もう一度送ってください");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <p className="feedback-note">
        使いにくいところや、うれしかったことを教えてください。読むのは開発者だけです
      </p>
      <textarea
        className="feedback-input"
        aria-label="目安箱に書く"
        // サーバが受け取れる長さ(backendのfeedback.dto.tsと同じ数)
        maxLength={1000}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button className="ghost-button" disabled={!canSend}>
        送る
      </button>
      {notice && (
        <p className="feedback-notice" role="status">
          {notice}
        </p>
      )}
    </form>
  );
}
