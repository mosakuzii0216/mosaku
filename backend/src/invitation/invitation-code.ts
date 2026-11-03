import { randomInt } from 'node:crypto';

// 見間違えやすい I・0・0・1 を抜いた32文字
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LENGTH = 8;

// 当てられにくいように、暗号に使える乱数で1文字ずつ選ぶ
export function generateCode(): string {
  let code = '';
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

// 打たれたコードをDBに持つ形にそろえる
// 全角は半角に、小文字は大文字にして、英数字のほか(ハイフンや空白)は消す
export function normalizeCode(input: string): string {
  return input
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '');
}

// 見せるときは、4文字ずつに分ける
export function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
