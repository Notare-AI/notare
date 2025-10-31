import type { EditorThemeClasses } from 'lexical';

export const theme: EditorThemeClasses = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'mb-2',
  quote: 'ml-4 border-l-4 border-primary pl-4 italic text-muted-foreground',
  heading: {
    h1: 'text-3xl font-bold mb-4',
    h2: 'text-2xl font-semibold mb-3',
    h3: 'text-xl font-semibold mb-2',
  },
  list: {
    nested: {
      listitem: 'ml-4',
    },
    ol: 'list-decimal ml-6 mb-2',
    ul: 'list-disc ml-6 mb-2',
    listitem: 'mb-1',
  },
  link: 'text-blue-500 hover:underline',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'bg-gray-100 dark:bg-gray-800 text-sm font-mono px-1 py-0.5 rounded',
    highlight: 'bg-yellow-200 dark:bg-yellow-800',
    subscript: 'align-sub',
    superscript: 'align-super',
  },
  code: 'bg-gray-100 dark:bg-gray-800 text-sm font-mono p-4 block rounded-md overflow-x-auto',
  hr: 'my-4 border-border',
};