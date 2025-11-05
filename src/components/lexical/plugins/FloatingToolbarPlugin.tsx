import { useState, useCallback, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  TextFormatType,
  $createParagraphNode,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  $isElementNode,
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
import FloatingToolbar from '../FloatingToolbar';

export default function FloatingToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        setIsVisible(true);
        
        // Check which formats are active
        const newActiveFormats = new Set<string>();
        
        // Check text formatting
        if (selection.hasFormat('bold')) newActiveFormats.add('bold');
        if (selection.hasFormat('italic')) newActiveFormats.add('italic');
        if (selection.hasFormat('underline')) newActiveFormats.add('underline');
        if (selection.hasFormat('strikethrough')) newActiveFormats.add('strikethrough');
        if (selection.hasFormat('code')) newActiveFormats.add('code');
        if (selection.hasFormat('highlight')) newActiveFormats.add('highlight');
        
        // Check for quotes and lists
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' 
          ? anchorNode 
          : anchorNode.getTopLevelElementOrThrow();
        
        if ($isQuoteNode(element)) {
          newActiveFormats.add('quote');
        }
        
        if ($isListNode(element)) {
          if (element.getListType() === 'bullet') {
            newActiveFormats.add('bulletList');
          } else if (element.getListType() === 'number') {
            newActiveFormats.add('numberedList');
          }
        }
        
        setActiveFormats(newActiveFormats);
      } else {
        setIsVisible(false);
        setActiveFormats(new Set());
      }
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      )
    );
  }, [editor, updateToolbar]);

  // Hide toolbar when clicking outside the editor or pressing Escape
  useEffect(() => {
    const handleClickOutside = () => {
      // Small delay to allow selection to update
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          setIsVisible(false);
        }
      }, 100);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFormat = useCallback((format: string) => {
    switch (format) {
      // Basic text formatting - use direct dispatch to avoid selection issues
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strikethrough':
      case 'code':
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as TextFormatType);
        break;
        
      // Text alignment - use direct dispatch
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
        
      // Lists - use direct dispatch
      case 'bulletList':
        if (activeFormats.has('bulletList')) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }
        break;
        
      case 'numberedList':
        if (activeFormats.has('numberedList')) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
        break;
        
      // Quote functionality - needs editor.update for DOM manipulation
      case 'quote':
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          
          const anchorNode = selection.anchor.getNode();
          let element = anchorNode.getKey() === 'root' 
            ? anchorNode 
            : anchorNode.getTopLevelElementOrThrow();
          
          // Ensure we have an ElementNode that can have children
          if (!$isElementNode(element)) {
            element = element.getTopLevelElementOrThrow();
          }
          
          if ($isQuoteNode(element)) {
            // Convert quote to paragraph
            const paragraph = $createParagraphNode();
            if (element.getChildrenSize() > 0) {
              paragraph.append(...element.getChildren());
            }
            element.replace(paragraph);
            paragraph.selectEnd();
          } else if ($isElementNode(element)) {
            // Convert to quote
            const quote = $createQuoteNode();
            if (element.getChildrenSize() > 0) {
              quote.append(...element.getChildren());
            }
            element.replace(quote);
            quote.selectEnd();
          }
        });
        break;
        
      // Clear formatting - check selection state first
      case 'clearFormatting':
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          
          // Clear text formatting by toggling each active format
          const formats: TextFormatType[] = ['bold', 'italic', 'underline', 'strikethrough', 'code'];
          formats.forEach(format => {
            if (selection.hasFormat(format)) {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
            }
          });
        });
        break;
        
      // Highlight functionality
      case 'highlight':
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight' as TextFormatType);
        break;
    }
    
    // Update toolbar state after formatting
    setTimeout(() => updateToolbar(), 50);
  }, [editor, activeFormats, updateToolbar]);

  return (
    <FloatingToolbar
      isVisible={isVisible}
      onFormat={handleFormat}
      activeFormats={activeFormats}
    />
  );
}