type LexicalNode = {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  tag?: string;
  listType?: 'bullet' | 'number';
  url?: string;
  [key: string]: any;
};

const processNodes = (nodes: LexicalNode[], listType?: 'bullet' | 'number'): string => {
  return nodes.map((node, i) => convertNodeToMarkdown(node, listType === 'number' ? i + 1 : undefined)).join('');
};

const formatText = (node: LexicalNode): string => {
  let text = node.text || '';
  if (!text) return '';

  const format = node.format || 0;
  if (format & 1) text = `**${text}**`; // Bold
  if (format & 2) text = `*${text}*`;  // Italic
  if (format & 4) text = `~~${text}~~`; // Strikethrough
  if (format & 16) text = `\`${text}\``; // Code

  return text;
};

const convertNodeToMarkdown = (node: LexicalNode, listIndex?: number): string => {
  const childrenMarkdown = node.children ? processNodes(node.children, node.listType) : '';

  switch (node.type) {
    case 'root':
      return childrenMarkdown;
    case 'paragraph':
      return `${childrenMarkdown}\n\n`;
    case 'heading':
      const level = parseInt(node.tag?.substring(1) || '1', 10);
      return `${'#'.repeat(level)} ${childrenMarkdown}\n\n`;
    case 'list':
      return childrenMarkdown;
    case 'listitem':
      const prefix = listIndex !== undefined ? `${listIndex}. ` : '* ';
      return `${prefix}${childrenMarkdown.trim()}\n`;
    case 'quote':
      const quoteLines = childrenMarkdown.trim().split('\n');
      return quoteLines.map(line => `> ${line}`).join('\n') + '\n\n';
    case 'link':
      return `[${childrenMarkdown}](${node.url})`;
    case 'text':
      return formatText(node);
    default:
      return childrenMarkdown;
  }
};

export const lexicalToMarkdown = (lexicalJsonString: string): string => {
  try {
    const lexicalData = JSON.parse(lexicalJsonString);
    if (!lexicalData.root) {
      return lexicalJsonString;
    }
    const markdown = convertNodeToMarkdown(lexicalData.root);
    return markdown.replace(/\n{3,}/g, '\n\n').trim();
  } catch (e) {
    return lexicalJsonString;
  }
};