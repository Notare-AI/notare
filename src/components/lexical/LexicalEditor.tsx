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
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { EditorState } from 'lexical';
import { 
  $getSelection, 
  $isRangeSelection, 
  SELECTION_CHANGE_COMMAND, 
  COMMAND_PRIORITY_LOW, 
  FORMAT_TEXT_COMMAND, 
  TextFormatType,
  $createParagraphNode,
  FORMAT_ELEMENT_COMMAND,
  ElementFormatType
} from 'lexical';
import { 
  $createQuoteNode,
  $isQuoteNode 
} from '@lexical/rich-text';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode
} from '@lexical/list';
import { mergeRegister } from '@lexical/utils';
import { cn } from '@/lib/utils';

import { theme } from './theme';
import { CodeHighlightPlugin } from './plugins/CodeHighlightPlugin';
import { HorizontalRuleNode } from './nodes/HorizontalRuleNode';
import HorizontalRulePlugin from './plugins/HorizontalRulePlugin';
import KeyboardShortcutsPlugin from './plugins/KeyboardShortcutsPlugin';

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
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
    HorizontalRuleNode,
  ],
};

interface LexicalEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  isEditable?: boolean;
  onSelectionChange?: (hasSelection: boolean, activeFormats: Set<string>) => void;
  onFormatCommand?: (format: string) => void;
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

// Selection tracking plugin to communicate with parent component
const SelectionTrackingPlugin = ({ onSelectionChange, onFormatCommand }: { 
  onSelectionChange?: (hasSelection: boolean, activeFormats: Set<string>) => void;
  onFormatCommand?: (format: string) => void;
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!onSelectionChange && !onFormatCommand) return;

    return mergeRegister(
      // Track selection changes
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          if (onSelectionChange) {
            editor.getEditorState().read(() => {
              const selection = $getSelection();
              
              if (!$isRangeSelection(selection) || selection.isCollapsed()) {
                onSelectionChange(false, new Set());
                return;
              }

              // Get active text formats
              const formats = new Set<string>();
              if (selection.hasFormat('bold')) formats.add('bold');
              if (selection.hasFormat('italic')) formats.add('italic');
              if (selection.hasFormat('underline')) formats.add('underline');
              if (selection.hasFormat('strikethrough')) formats.add('strikethrough');
              if (selection.hasFormat('code')) formats.add('code');
              
              // Check for lists and quotes
              const anchorNode = selection.anchor.getNode();
              const element = anchorNode.getKey() === 'root' 
                ? anchorNode 
                : anchorNode.getTopLevelElementOrThrow();
              
              if ($isListNode(element)) {
                const listType = element.getListType();
                if (listType === 'bullet') {
                  formats.add('bulletList');
                } else if (listType === 'number') {
                  formats.add('numberedList');
                }
              }
              
              if ($isQuoteNode(element)) {
                formats.add('quote');
              }
              
              onSelectionChange(true, formats);
            });
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      )
    );
  }, [editor, onSelectionChange, onFormatCommand]);

  // Expose format command to parent
  useEffect(() => {
    if (onFormatCommand) {
      // Store the format function in a way the parent can access it
      (window as any).lexicalFormat = (format: string) => {
        editor.update(() => {
          const selection = $getSelection();
          
          if (!$isRangeSelection(selection)) return;

          switch (format) {
            // Basic formatting
            case 'bold':
            case 'italic':
            case 'underline':
            case 'strikethrough':
            case 'code':
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as TextFormatType);
              break;
            
            // Alignment
            case 'alignLeft':
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left' as ElementFormatType);
              break;
            case 'alignCenter':
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center' as ElementFormatType);
              break;
            case 'alignRight':
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right' as ElementFormatType);
              break;
            case 'alignJustify':
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify' as ElementFormatType);
              break;
              
            // Clear formatting (basic)
            case 'clearFormatting':
              // Remove all text formatting using the correct API
              if (selection.hasFormat('bold')) {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold' as TextFormatType);
              }
              if (selection.hasFormat('italic')) {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic' as TextFormatType);
              }
              if (selection.hasFormat('underline')) {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline' as TextFormatType);
              }
              if (selection.hasFormat('strikethrough')) {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough' as TextFormatType);
              }
              if (selection.hasFormat('code')) {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code' as TextFormatType);
              }
              break;
              
            // Lists
            case 'bulletList':
              const anchorNode = selection.anchor.getNode();
              const element = anchorNode.getKey() === 'root' 
                ? anchorNode 
                : anchorNode.getTopLevelElementOrThrow();
              
              if ($isListNode(element) && element.getListType() === 'bullet') {
                editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
              } else {
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
              }
              break;
              
            case 'numberedList':
              const anchorNode2 = selection.anchor.getNode();
              const element2 = anchorNode2.getKey() === 'root' 
                ? anchorNode2 
                : anchorNode2.getTopLevelElementOrThrow();
              
              if ($isListNode(element2) && element2.getListType() === 'number') {
                editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
              } else {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
              }
              break;
              
            // Quote
            case 'quote':
              const anchorNode3 = selection.anchor.getNode();
              const element3 = anchorNode3.getKey() === 'root' 
                ? anchorNode3 
                : anchorNode3.getTopLevelElementOrThrow();
                
              if ($isQuoteNode(element3)) {
                // Convert quote to paragraph
                const paragraph = $createParagraphNode();
                element3.replace(paragraph);
              } else {
                // Convert to quote
                const quote = $createQuoteNode();
                element3.replace(quote);
              }
              break;
          }
        });
      };
    }
    return () => {
      if ((window as any).lexicalFormat) {
        delete (window as any).lexicalFormat;
      }
    };
  }, [editor, onFormatCommand]);

  return null;
};

export default function LexicalEditor({
  initialValue,
  onChange,
  isEditable = true,
  onSelectionChange,
  onFormatCommand,
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
        <div className="relative flex-grow">
          <RichTextPlugin
            contentEditable={<ContentEditable className={cn("outline-none w-full h-full p-1", isEditable ? "cursor-text" : "cursor-default")} />}
            placeholder={<div className={cn("absolute top-1 left-1 text-gray-400 pointer-events-none", !isEditable && "hidden")}>Start typing your note... Use **bold**, *italic*, or # headings</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <LinkPlugin />
          <CodeHighlightPlugin />
          <HorizontalRulePlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <KeyboardShortcutsPlugin />
          {isEditable && <SelectionTrackingPlugin onSelectionChange={onSelectionChange} onFormatCommand={onFormatCommand} />}
          <AutoFocusOnEditPlugin editable={isEditable} />
          {onChange && <OnChangePlugin onChange={handleOnChange} ignoreSelectionChange />}
          <UpdateEditablePlugin editable={isEditable} />
        </div>
      </div>
    </LexicalComposer>
  );
}