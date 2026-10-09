type Props = {
  message: string;
  onClose: () => void;
};

// 画面の上に出す知らせ。閉じるまで出したままにする
export function Notice({ message, onClose }: Props) {
  return (
    <div className="notice" role="alert">
      <p>{message}</p>
      <button className="ghost-button" onClick={onClose}>
        閉じる
      </button>
    </div>
  );
}
