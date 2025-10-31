import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { EditorState } from 'lexical';
import { cn } from '@/lib/utils';

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

// This component ensures the editor's editable state is always in sync.
const UpdateEditablePlugin = ({ editable }: { editable: boolean }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
};

// This new plugin will focus the editor whenever it becomes editable.
const AutoFocusOnEditPlugin = ({ editable }: { editable: boolean }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (editable) {
      // We use a timeout to ensure that the focus happens after the DOM has been updated
      // and the editor is truly ready to receive focus.
      setTimeout(() => {
        editor.focus(undefined, { defaultSelection: 'rootEnd' });
      }, 0);
    }
  }, [editor, editable]);

  return null;
};

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
            contentEditable={<ContentEditable className={cn("outline-none w-full h-full p-1", isEditable ? "cursor-text" : "cursor-default")} />}
            placeholder={<div className={cn("absolute top-1 left-1 text-gray-400 pointer-events-none", !isEditable && "hidden")}>Type something...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <AutoFocusOnEditPlugin editable={isEditable} />
          {onChange && <OnChangePlugin onChange={handleOnChange} ignoreSelectionChange />}
          <UpdateEditablePlugin editable={isEditable} />
        </div>
      </div>
    </LexicalComposer>
  );
}