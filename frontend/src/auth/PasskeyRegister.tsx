import { useState } from "react";
import { registerPasskey, loginWithPasskey } from "./passkeyApi";
import { passkeyErrorMessage } from "./passkeyError";

type Props = {
  hasPasskey: boolean;
  canLogin: boolean;
  onLogin: () => void;
  onRegistered: () => void;
};

export function PasskeyRegister({
  hasPasskey,
  canLogin,
  onLogin,
  onRegistered,
}: Props) {
  const [status, setStatus] = useState("");

  const register = async () => {
    setStatus("登録中...");
    try {
      await registerPasskey("このデバイス");
      setStatus("パスキーを登録しました");
      onRegistered();
    } catch (e) {
      setStatus(passkeyErrorMessage(e));
    }
  };

  const login = async () => {
    setStatus("ログイン中...");
    try {
      await loginWithPasskey();
      setStatus("ログインしました");
      onLogin();
    } catch (e) {
      setStatus(passkeyErrorMessage(e));
    }
  };

  return (
    <div className="passkey">
      <button className="ghost-button" onClick={register}>
        {hasPasskey ? "パスキーを追加" : "パスキーを登録"}
      </button>
      {/* 前に別の端末で登録した人の入り口。登録済みの端末はもう入っているので出さない */}
      {canLogin && (
        <>
          <p className="passkey-note">すでに登録している方</p>
          <button className="ghost-button" onClick={login}>
            パスキーでログイン
          </button>
        </>
      )}
      {/* 知らせが無いときは行ごと出さない。空いた隙間を作らないため */}
      {status && <span className="status">{status}</span>}
    </div>
  );
}
