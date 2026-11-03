import { formatCode, generateCode, normalizeCode } from './invitation-code';

describe('invitation-code', () => {
  it('generateCodeは、見間違えにくい文字だけで8文字を作る', () => {
    for (let i = 0; i < 100; i++) {
      // I・0・0・1 は入らない
      expect(generateCode()).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    }
  });

  it('generateCodeは、呼ぶたびに違うコードを作る', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateCode()));
    expect(codes.size).toBe(100);
  });

  it('normalizeCodeは、小文字・ハイフン・空白をそろえる', () => {
    expect(normalizeCode(' abcd-efgh ')).toBe('ABCDEFGH');
  });

  it('normalizeCodeは、全角で打たれても揃える', () => {
    expect(normalizeCode('ＡＢＣＤーＥＦＧＨ')).toBe('ABCDEFGH');
  });

  it('formatCodeは、4文字ずつハイフンでつなぐ', () => {
    expect(formatCode('ABCDEFGH')).toBe('ABCD-EFGH');
  });
});
