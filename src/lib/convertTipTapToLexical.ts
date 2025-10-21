// Basic type definitions for clarity.
type TipTapNode = {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: any;
  marks?: { type: string; attrs?: any }[];
};

type LexicalNode = {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  tag?: string;
  listType?: 'bullet' | 'number';
  direction?: 'ltr';
  indent?: number;
  version: number;
  style?: string;
  mode?: string;
  url?: string;
  rel?: string;
  target?: string;
  language?: string;
  value?: number;
};

const convertMarksToFormat = (marks: { type: string }[] = []): number => {
  let format = 0;
  if (marks.some(mark => mark.type === 'bold')) format |= 1;
  if (marks.some(mark => mark.type === 'italic')) format |= 2;
  if (marks.some(mark => mark.type === 'underline')) format |= 8;
  if (marks.some(mark => mark.type === 'strike')) format |= 4;
  if (marks.some(mark => mark.type === 'code')) format |= 16;
  return format;
};

const convertTipTapNodeToLexical = (node: TipTapNode): LexicalNode | LexicalNode[] | null => {
  switch (node.type) {
    case 'doc':
      return {
        type: 'root',
        children: node.content?.flatMap(convertTipTapNodeToLexical).filter(Boolean) as LexicalNode[] || [],
        direction: 'ltr',
        format: 0,
        indent: 0,
        version: 1,
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        children: node.content?.flatMap(convertTipTapNodeToLexical).filter(Boolean) as LexicalNode[] || [],
        direction: 'ltr',
        format: 0,
        indent: 0,
        version: 1,
      };

    case 'heading':
      return {
        type: 'heading',
        tag: `h${node.attrs?.level || 1}`,
        children: node.content?.flatMap(convertTipTapNodeToLexical).filter(Boolean) as LexicalNode[] || [],
        direction: 'ltr',
        format: 0,
        indent: 0,
        version: 1,
      };

    case 'text': {
      const linkMark = node.marks?.find(mark => mark.type === 'link');
      if (linkMark) {
        return {
          type: 'link',
          url: linkMark.attrs?.href,
          rel: linkMark.attrs?.rel,
          target: linkMark.attrs?.target,
          children: [{
            type: 'text',
            text: node.text || '',
            format: convertMarksToFormat(node.marks?.filter(m => m.type !== 'link')),
            mode: 'normal',
            style: '',
            version: 1,
          }],
          direction: 'ltr',
          format: 0,
          indent: 0,
          version: 1,
        };
      }
      return {
        type: 'text',
        text: node.text || '',
        format: convertMarksToFormat(node.marks),
        mode: 'normal',
        style: '',
        version: 1,
      };
    }

    case 'bulletList':
      return {
        type: 'list',
        listType: 'bullet',
        children: node.content?.flatMap(convertTipTapNodeToLexical).filter(Boolean) as LexicalNode[] || [],
        direction: 'ltr',
        format: 0,
        indent: 0,
        version: 1,
        tag: 'ul',
      };

    case 'orderedList':
      return {
        type: 'list',
        listType: 'number',
        children: node.content?.flatMap(convertTipTapNodeToLexical).filter(Boolean) as LexicalNode[] || [],
        direction: 'ltr',
        format: 0,
        indent: 0,
        version: 1,
        tag: 'ol',
      };

    case 'listItem':
      return {
        type: 'listitem',
        children: node.content?.flatMap(convertTipTapNodeToLexical).filter(Boolean) as LexicalNode[] || [],
        direction: 'ltr',
        format: 0,
        indent: 0,
        version: 1,
        value: 1,
      };

    case 'blockquote':
      return {
        type: 'quote',
        children: node.content?.flatMap(convertTipTapNodeToLexical).filter(Boolean) as LexicalNode[] || [],
        direction: 'ltr',
        format: 0,
        indent: 0,
        version: 1,
      };

    case 'codeBlock':
      return {
        type: 'code',
        language: node.attrs?.language || 'javascript',
        children: node.content?.map(n => ({
          type: 'text',
          text: n.text || '',
          format: 0,
          mode: 'normal',
          style: '',
          version: 1,
        })) || [],
        direction: 'ltr',
        format: 0,
        indent: 0,
        version: 1,
      };

    default:
      if (node.content) {
        return {
          type: 'paragraph',
          children: node.content.flatMap(convertTipTapNodeToLexical).filter(Boolean) as LexicalNode[],
          direction: 'ltr',
          format: 0,
          indent: 0,
          version: 1,
        };
      }
      return null;
  }
};

export const convertTipTapToLexical = (tipTapJSON: any): string => {
  if (!tipTapJSON || typeof tipTapJSON !== 'object' || tipTapJSON.type !== 'doc') {
    return JSON.stringify({
      root: {
        children: [{
          children: [],
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1
        }],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    });
  }

  const lexicalTree = convertTipTapNodeToLexical(tipTapJSON as TipTapNode);
  return JSON.stringify({ root: lexicalTree });
};

export const isTipTapJSON = (jsonString: string): boolean => {
  try {
    const obj = JSON.parse(jsonString);
    return obj && obj.type === 'doc' && Array.isArray(obj.content);
  } catch (e) {
    return false;
  }
};

export const isLexicalJSON = (jsonString: string): boolean => {
  try {
    const obj = JSON.parse(jsonString);
    return obj && obj.root && obj.root.type === 'root';
  } catch (e) {
    return false;
  }
};