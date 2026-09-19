// キャッシュしないService Worker。
// Chromeのインストール条件がfetchハンドラを要求するので置いているだけで、
// 何も保存しない。v1で古い画面を配り続けた事故を繰り返さないため。

self.addEventListener("install", () => {
  // 待たずにすぐ新しい版を有効にする
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // 何もしない=ブラウザが普通にネットワークへ取りに行く
});
