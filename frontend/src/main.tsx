import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ensureSession } from "./session";
import { takeInviteFailure, takeLoginFailed } from "./auth/loginResult";

// Googleから「失敗」や「招待コードを使えなかった」で戻ってきたかを、描く前に読み取っておく
const loginFailed = takeLoginFailed();
const inviteFailure = takeInviteFailure();

// 先に匿名のCookieを受け取ってから描く。描くと同時に複数のリクエストが飛ぶので、
// Coookie無しで飛ぶと匿名ユーザが何人も作られてしまう。
void ensureSession().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App loginFailed={loginFailed} inviteFailure={inviteFailure} />
    </StrictMode>,
  );
});

// 画面の描画を邪魔しないようload後に登録する
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
