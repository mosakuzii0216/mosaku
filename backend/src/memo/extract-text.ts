// TipTapのJSONからプレーンテキストを検索用に抜く。
type TipTapNode = { type?: string; text?: string; content?: TipTapNode[] };

// 抜けたら改行を入れるノード(段落や見出すの区切り)
const BLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'listItem',
  'blockquote',
  'codeBlock',
  'horizontalRule',
]);

export function extractText(content: unknown): string {
  if (typeof content !== 'object' || content === null) return '';

  const walk = (node: TipTapNode): string => {
    if (typeof node.text === 'string') return node.text;
    const inner = (node.content ?? []).map(walk).join('');
    return BLOCK_TYPES.has(node.type ?? '') ? inner + '\n' : inner;
  };

  return walk(content as TipTapNode).trim();
}
