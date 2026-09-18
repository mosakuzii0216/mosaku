import { useState } from "react";
import { registerPasskey } from "./passkeyApi";

export function PasskeyRegister() {
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

  return (
    <div className="passkey">
      <button className="ghost-button" onClick={register}>
        パスキーを登録
      </button>
      <span className="status">{status}</span>
    </div>
  );
}
