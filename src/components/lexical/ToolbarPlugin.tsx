import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  Bold, Italic, Underline, Strikethrough, Code, Link, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Undo, Redo, CheckSquare
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LowPriority = 1;

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const formatHeading = (tag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        const parent = node.getParent();
        if ($isHeadingNode(parent) && parent.getTag() === tag) {
          // If it's already the same heading, convert back to paragraph
          const paragraph = $createParagraphNode();
          parent.replace(paragraph);
          paragraph.select();
        } else {
          const heading = $createHeadingNode(tag);
          if (parent.getTextContent()) {
            heading.append(...parent.getChildren());
          }
          parent.replace(heading);
          heading.select();
        }
      }
    });
  };

  return (
    <div className="flex items-center flex-wrap gap-1 p-1 bg-gray-100 dark:bg-[#2A2A2A] rounded-t-md border-b border-gray-200 dark:border-gray-700">
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} disabled={!canUndo} className="h-8 w-8"><Undo size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} disabled={!canRedo} className="h-8 w-8"><Redo size={16} /></Button>
      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => formatHeading('h1')} className="h-8 w-8"><Heading1 size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => formatHeading('h2')} className="h-8 w-8"><Heading2 size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => formatHeading('h3')} className="h-8 w-8"><Heading3 size={16} /></Button>
      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={cn('h-8 w-8', isBold && 'bg-gray-200 dark:bg-gray-700')}><Bold size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={cn('h-8 w-8', isItalic && 'bg-gray-200 dark:bg-gray-700')}><Italic size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={cn('h-8 w-8', isUnderline && 'bg-gray-200 dark:bg-gray-700')}><Underline size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} className={cn('h-8 w-8', isStrikethrough && 'bg-gray-200 dark:bg-gray-700')}><Strikethrough size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')} className={cn('h-8 w-8', isCode && 'bg-gray-200 dark:bg-gray-700')}><Code size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={insertLink} className={cn('h-8 w-8', isLink && 'bg-gray-200 dark:bg-gray-700')}><Link size={16} /></Button>
      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className="h-8 w-8"><List size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className="h-8 w-8"><ListOrdered size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)} className="h-8 w-8"><CheckSquare size={16} /></Button>
    </div>
  );
}