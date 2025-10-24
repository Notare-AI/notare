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
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  Bold, Italic, Underline, Strikethrough, Code, Link, List, ListOrdered, Heading1, Heading2, Heading3, Undo, Redo, CheckSquare
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
  const [blockType, setBlockType] = useState('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Text formats
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      // Link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      // Block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

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
    if (blockType !== tag) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $createHeadingNode(tag).select();
        }
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $createParagraphNode().select();
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-1 p-1 bg-gray-100 dark:bg-[#2A2A2A] rounded-t-md border-b border-gray-200 dark:border-gray-700">
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} disabled={!canUndo} className="h-8 w-8"><Undo size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} disabled={!canRedo} className="h-8 w-8"><Redo size={16} /></Button>
      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => formatHeading('h1')} className={cn('h-8 w-8', blockType === 'h1' && 'bg-gray-200 dark:bg-gray-700')}><Heading1 size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => formatHeading('h2')} className={cn('h-8 w-8', blockType === 'h2' && 'bg-gray-200 dark:bg-gray-700')}><Heading2 size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => formatHeading('h3')} className={cn('h-8 w-8', blockType === 'h3' && 'bg-gray-200 dark:bg-gray-700')}><Heading3 size={16} /></Button>
      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={cn('h-8 w-8', isBold && 'bg-gray-200 dark:bg-gray-700')}><Bold size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={cn('h-8 w-8', isItalic && 'bg-gray-200 dark:bg-gray-700')}><Italic size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={cn('h-8 w-8', isUnderline && 'bg-gray-200 dark:bg-gray-700')}><Underline size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} className={cn('h-8 w-8', isStrikethrough && 'bg-gray-200 dark:bg-gray-700')}><Strikethrough size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')} className={cn('h-8 w-8', isCode && 'bg-gray-200 dark:bg-gray-700')}><Code size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={insertLink} className={cn('h-8 w-8', isLink && 'bg-gray-200 dark:bg-gray-700')}><Link size={16} /></Button>
      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button variant="ghost" size="icon" onClick={formatBulletList} className={cn('h-8 w-8', blockType === 'bullet' && 'bg-gray-200 dark:bg-gray-700')}><List size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={formatNumberedList} className={cn('h-8 w-8', blockType === 'number' && 'bg-gray-200 dark:bg-gray-700')}><ListOrdered size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={formatCheckList} className={cn('h-8 w-8', blockType === 'check' && 'bg-gray-200 dark:bg-gray-700')}><CheckSquare size={16} /></Button>
    </div>
  );
}