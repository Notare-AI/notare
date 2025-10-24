type LexicalNode = {
  type: string;
  [key: string]: any;
};

const parseInlineText = (text: string): LexicalNode[] => {
  const nodes: LexicalNode[] = [];
  // This regex handles **bold** and *italic* text.
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, boldDelim, boldText, italicDelim, italicText] = match;
    
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: text.substring(lastIndex, match.index), version: 1, format: 0 });
    }

    const format = boldText ? 1 : 2; // 1 for bold, 2 for italic
    const content = boldText || italicText;
    if (content) {
      nodes.push({ type: 'text', text: content, version: 1, format });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', text: text.substring(lastIndex), version: 1, format: 0 });
  }
  return nodes;
};

export const markdownToLexicalJson = (markdown: string): string => {
  const rootChildren: any[] = [];
  const lines = markdown.split('\n');
  let currentListItems: any[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      rootChildren.push({
        type: 'list',
        tag: 'ul',
        listType: 'bullet',
        version: 1,
        children: currentListItems,
        direction: null, format: '', indent: 0,
      });
      currentListItems = [];
    }
  };

  lines.forEach(line => {
    const headingMatch = line.match(/^(#{1,3})\s(.*)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      rootChildren.push({
        type: 'heading',
        tag: `h${level}`,
        version: 1,
        children: parseInlineText(content),
        direction: null, format: '', indent: 0,
      });
      return;
    }

    const listItemMatch = line.match(/^(\s*)[-*]\s(.*)/);
    if (listItemMatch) {
      const content = listItemMatch[2];
      currentListItems.push({
        type: 'listitem',
        value: 1,
        version: 1,
        children: [{
          type: 'paragraph',
          version: 1,
          children: parseInlineText(content),
          direction: null, format: '', indent: 0,
        }],
        direction: null, format: '', indent: 0,
      });
      return;
    }

    flushList();
    if (line.trim() !== '') {
      rootChildren.push({
        type: 'paragraph',
        version: 1,
        children: parseInlineText(line),
        direction: null, format: '', indent: 0,
      });
    } else if (rootChildren.length > 0 && (rootChildren[rootChildren.length - 1].children?.length > 0 || rootChildren[rootChildren.length - 1].type !== 'paragraph')) {
      rootChildren.push({
        type: 'paragraph',
        version: 1,
        children: [],
        direction: null, format: '', indent: 0,
      });
    }
  });

  flushList();

  return JSON.stringify({
    root: {
      type: 'root',
      version: 1,
      children: rootChildren,
      direction: null, format: '', indent: 0,
    }
  });
};