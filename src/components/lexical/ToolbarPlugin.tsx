import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
  LexicalEditor,
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
  $createQuoteNode,
  $isQuoteNode,
  HeadingTagType,
} from '@lexical/rich-text';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import {
  Bold, Italic, Underline, Strikethrough, Code, Link, List, ListOrdered, Heading1, Heading2, Heading3, Undo, Redo, CheckSquare, Pilcrow, Quote as QuoteIcon, Code2, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify, Subscript, Superscript, Highlighter, Minus, Plus
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { INSERT_HORIZONTAL_RULE_COMMAND } from './plugins/HorizontalRulePlugin';

const LowPriority = 1;

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

const BlockFormatDropdown = ({
  blockType,
  editor,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  editor: LexicalEditor;
}) => {
  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $createParagraphNode().select();
        }
      });
    }
  };

  const formatHeading = (tag: HeadingTagType) => {
    if (blockType !== tag) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $createHeadingNode(tag).select();
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

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $createQuoteNode().select();
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $createCodeNode().select();
        }
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 px-2">
          {blockTypeToBlockName[blockType]}
          <ChevronDown size={16} className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={formatParagraph}><Pilcrow className="mr-2 h-4 w-4" /> Normal</DropdownMenuItem>
        <DropdownMenuItem onClick={() => formatHeading('h1')}><Heading1 className="mr-2 h-4 w-4" /> Heading 1</DropdownMenuItem>
        <DropdownMenuItem onClick={() => formatHeading('h2')}><Heading2 className="mr-2 h-4 w-4" /> Heading 2</DropdownMenuItem>
        <DropdownMenuItem onClick={() => formatHeading('h3')}><Heading3 className="mr-2 h-4 w-4" /> Heading 3</DropdownMenuItem>
        <DropdownMenuItem onClick={formatBulletList}><List className="mr-2 h-4 w-4" /> Bulleted List</DropdownMenuItem>
        <DropdownMenuItem onClick={formatNumberedList}><ListOrdered className="mr-2 h-4 w-4" /> Numbered List</DropdownMenuItem>
        <DropdownMenuItem onClick={formatCheckList}><CheckSquare className="mr-2 h-4 w-4" /> Check List</DropdownMenuItem>
        <DropdownMenuItem onClick={formatQuote}><QuoteIcon className="mr-2 h-4 w-4" /> Quote</DropdownMenuItem>
        <DropdownMenuItem onClick={formatCode}><Code2 className="mr-2 h-4 w-4" /> Code Block</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Text formats
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsHighlight(selection.hasFormat('highlight'));

      // Link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      // Block type
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            setBlockType('code');
          }
          if ($isQuoteNode(element)) {
            setBlockType('quote');
          }
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
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => { updateToolbar(); return false; }, LowPriority),
      editor.registerCommand(CAN_UNDO_COMMAND, (payload) => { setCanUndo(payload); return false; }, LowPriority),
      editor.registerCommand(CAN_REDO_COMMAND, (payload) => { setCanRedo(payload); return false; }, LowPriority),
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="flex items-center flex-wrap gap-1 p-1 bg-gray-100 dark:bg-[#2A2A2A] rounded-t-md border-b border-gray-200 dark:border-gray-700">
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} disabled={!canUndo} className="h-8 w-8"><Undo size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} disabled={!canRedo} className="h-8 w-8"><Redo size={16} /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <BlockFormatDropdown blockType={blockType} editor={editor} />
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={cn('h-8 w-8', isBold && 'bg-gray-200 dark:bg-gray-700')}><Bold size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={cn('h-8 w-8', isItalic && 'bg-gray-200 dark:bg-gray-700')}><Italic size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={cn('h-8 w-8', isUnderline && 'bg-gray-200 dark:bg-gray-700')}><Underline size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} className={cn('h-8 w-8', isStrikethrough && 'bg-gray-200 dark:bg-gray-700')}><Strikethrough size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')} className={cn('h-8 w-8', isCode && 'bg-gray-200 dark:bg-gray-700')}><Code size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={insertLink} className={cn('h-8 w-8', isLink && 'bg-gray-200 dark:bg-gray-700')}><Link size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')} className={cn('h-8 w-8', isHighlight && 'bg-gray-200 dark:bg-gray-700')}><Highlighter size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')} className={cn('h-8 w-8', isSubscript && 'bg-gray-200 dark:bg-gray-700')}><Subscript size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')} className={cn('h-8 w-8', isSuperscript && 'bg-gray-200 dark:bg-gray-700')}><Superscript size={16} /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}><AlignLeft size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}><AlignCenter size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}><AlignRight size={16} /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}><AlignJustify size={16} /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 px-2">
            <Plus size={16} className="mr-2" />
            Insert
            <ChevronDown size={16} className="ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}>
            <Minus className="mr-2 h-4 w-4" />
            Horizontal Rule
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}