import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TRANSFORMERS } from '@lexical/markdown';
import { EditorState } from 'lexical';
import { theme } from './theme';
import { useState } from 'react';

const editorConfig = {
  namespace: 'InlineEditor',
  theme,
  onError(error: Error) {
    console.error("Lexical Inline Error:", error);
  },
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, AutoLinkNode, LinkNode],
};

interface InlineLexicalEditorProps {
  initialState: string;
  onSave: (state: string) => void;
  onCancel: () => void;
}

export default function InlineLexicalEditor({ initialState, onSave, onCancel }: InlineLexicalEditorProps) {
  const [editorState, setEditorState] = useState(initialState);

  const handleSave = () => {
    onSave(editorState);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <LexicalComposer initialConfig={{ ...editorConfig, editorState: initialState }}>
      <div className="relative w-full h-full" onKeyDown={handleKeyDown}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="outline-none w-full h-full p-0 cursor-text"
              onBlur={handleSave}
            />
          }
          placeholder={<div className="absolute top-0 left-0 text-gray-400 pointer-events-none">Type here...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={(state) => setEditorState(JSON.stringify(state.toJSON()))} />
      </div>
    </LexicalComposer>
  );
}