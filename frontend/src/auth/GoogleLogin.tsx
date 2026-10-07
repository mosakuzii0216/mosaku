const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

type Props = { linked: boolean };

// Googleで続ける入り口。ページごとGoogleへ移動するので、ボタンではなくリンクにする
export function GoogleLogin({ linked }: Props) {
  if (linked) {
    return <p className="passkey-note">Googleと連携済み</p>;
  }

  return (
    <a
      className="ghost-button google-login"
      href={`${API_BASE}/auth/google/start`}
    >
      Googleで続ける
    </a>
  );
}
