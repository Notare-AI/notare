import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { EditorState } from 'lexical';

import ToolbarPlugin from './plugins/ToolbarPlugin';
import { isLexicalJSON } from '@/lib/convertTipTapToLexical';

const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-muted px-1 rounded',
  },
  heading: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-semibold',
  },
  list: {
    ul: 'list-disc list-inside',
    ol: 'list-decimal list-inside',
  },
  quote: 'border-l-4 border-border pl-4 italic',
  link: 'text-primary hover:underline',
};

const nodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
];

const fallbackContent = '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';

// Custom plugin to update editor state when the initialContent prop changes externally.
function UpdatePlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render because the editor is already initialized with the correct state.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Compare the external content with the editor's current content.
    // This prevents resetting the editor (and losing cursor position) while the user is actively typing in it.
    const editorState = editor.getEditorState();
    const currentContent = JSON.stringify(editorState.toJSON());

    if (currentContent !== content) {
      try {
        const newEditorState = editor.parseEditorState(content);
        editor.setEditorState(newEditorState);
      } catch (e) {
        console.error("Failed to parse editor state string from external update", e);
        const fallbackState = editor.parseEditorState(fallbackContent);
        editor.setEditorState(fallbackState);
      }
    }
  }, [content, editor]);

  return null;
}

interface LexicalEditorProps {
  initialContent: string;
  onChange?: (editorStateJSON: string) => void;
  isEditable?: boolean;
  showToolbar?: boolean;
}

const LexicalEditor = ({
  initialContent,
  onChange,
  isEditable = true,
  showToolbar = true,
}: LexicalEditorProps) => {
  const safeInitialContent = isLexicalJSON(initialContent) ? initialContent : fallbackContent;

  const editorConfig = {
    namespace: 'LexicalEditor',
    theme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes,
    editorState: safeInitialContent,
    editable: isEditable,
  };

  const handleOnChange = (editorState: EditorState) => {
    if (onChange) {
      onChange(JSON.stringify(editorState.toJSON()));
    }
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="relative flex flex-col h-full">
        {showToolbar && isEditable && <ToolbarPlugin />}
        <div className="relative flex-grow">
          <RichTextPlugin
            contentEditable={<ContentEditable className={cn("outline-none w-full h-full p-1", isEditable ? "cursor-text" : "cursor-default")} />}
            placeholder={<div className={cn("absolute top-1 left-1 text-gray-400 pointer-events-none", !isEditable && "hidden")}>Type something...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        {onChange && <OnChangePlugin onChange={handleOnChange} ignoreSelectionChange />}
        <UpdatePlugin content={safeInitialContent} />
      </div>
    </LexicalComposer>
  );
};

export default LexicalEditor;