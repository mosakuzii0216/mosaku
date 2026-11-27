// APIの呼び先。本番はVercelの環境変数で決めて、手元ではbackendへ直接つなぐ
export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
