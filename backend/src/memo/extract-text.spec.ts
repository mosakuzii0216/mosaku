import { extractText } from './extract-text';

describe('extractText', () => {
  it('段落のテキストを抜く', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'こんにちは' }] },
      ],
    };
    expect(extractText(doc)).toBe('こんにちは');
  });

  it('ブロックの区切りを改行にする', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', content: [{ type: 'text', text: '見出し' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '本文' }] },
      ],
    };
    expect(extractText(doc)).toBe('見出し\n本文');
  });

  it('空のドキュメントは空文字を返す', () => {
    expect(extractText({ type: 'doc', content: [] })).toBe('');
  });

  it('壊れた入力でも落ちない', () => {
    expect(extractText(null)).toBe('');
    expect(extractText('文字列')).toBe('');
  });
});
