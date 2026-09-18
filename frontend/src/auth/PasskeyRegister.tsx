import { useState } from "react";
import { registerPasskey, loginWithPasskey } from "./passkeyApi";

type Props = { onLogin: () => void };

export function PasskeyRegister({ onLogin }: Props) {
  const [status, setStatus] = useState("");

  const register = async () => {
    setStatus("登録中...");
    try {
      await registerPasskey("このデバイス");
      setStatus("パスキーを登録しました");
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
      <button className="ghost-button" onClick={register}>
        パスキーを登録
      </button>
      <button className="ghost-button" onClick={login}>
        パスキーでログイン
      </button>
      <span className="status">{status}</span>
    </div>
  );
}
