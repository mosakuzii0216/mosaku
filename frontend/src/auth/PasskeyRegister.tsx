import { useState } from "react";
import { registerPasskey, loginWithPasskey } from "./passkeyApi";

type Props = {
  hasPasskey: boolean;
  onLogin: () => void;
  onRegistered: () => void;
};

export function PasskeyRegister({ hasPasskey, onLogin, onRegistered }: Props) {
  const [status, setStatus] = useState("");

  const register = async () => {
    setStatus("登録中...");
    try {
      await registerPasskey("このデバイス");
      setStatus("パスキーを登録しました");
      onRegistered();
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    }
  };

  const login = async () => {
    setStatus("ログイン中...");
    try {
      await loginWithPasskey();
      setStatus("ログインしました");
      onLogin();
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    }
  };

  return (
    <div className="passkey">
      <p className="passkey-note">
        {hasPasskey
          ? "パスキー登録済み"
          : "パスキー未登録。登録すると、他の端末からも同じメモを開けます"}
      </p>
      <button className="ghost-button" onClick={register}>
        {hasPasskey ? "パスキーを追加" : "パスキーを登録"}
      </button>
      {/* 登録済みの端末はもうログインしているので出さない */}
      {!hasPasskey && (
        <button className="ghost-button" onClick={login}>
          パスキーでログイン
        </button>
      )}
      <span className="status">{status}</span>
    </div>
  );
}
