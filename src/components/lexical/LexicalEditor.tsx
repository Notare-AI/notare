import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { EditorState } from 'lexical';

import { theme } from './theme';
import ToolbarPlugin from './ToolbarPlugin';

const editorConfig = {
  namespace: 'NotareEditor',
  theme,
  onError(error: Error) {
    console.error("Lexical Error:", error);
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    AutoLinkNode,
    LinkNode,
  ],
};

interface LexicalEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  isEditable?: boolean;
  showToolbar?: boolean;
}

export default function LexicalEditor({
  initialValue,
  onChange,
  isEditable = true,
  showToolbar = true,
}: LexicalEditorProps) {
  const handleOnChange = (editorState: EditorState) => {
    if (onChange) {
      const json = editorState.toJSON();
      onChange(JSON.stringify(json));
    }
  };

  return (
    <LexicalComposer initialConfig={{ ...editorConfig, editorState: initialValue, editable: isEditable }}>
      <div className="lexical-container bg-transparent w-full h-full flex flex-col">
        {showToolbar && isEditable && <ToolbarPlugin />}
        <div className="relative flex-grow">
          <RichTextPlugin
            contentEditable={<ContentEditable className="outline-none w-full h-full" />}
            placeholder={<div className="absolute top-0 left-0 text-gray-400 pointer-events-none">Type something...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          {onChange && <OnChangePlugin onChange={handleOnChange} ignoreSelectionChange />}
        </div>
      </div>
    </LexicalComposer>
  );
}