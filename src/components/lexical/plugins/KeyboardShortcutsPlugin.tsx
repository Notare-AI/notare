import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  COMMAND_PRIORITY_NORMAL
} from 'lexical';
import { useEffect } from 'react';
import { mergeRegister } from '@lexical/utils';

export default function KeyboardShortcutsPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // Bold: Ctrl+B / Cmd+B
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (event) => {
          const { code, ctrlKey, metaKey } = event;
          if (code === 'KeyB' && (ctrlKey || metaKey)) {
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL,
      ),

      // Italic: Ctrl+I / Cmd+I
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (event) => {
          const { code, ctrlKey, metaKey } = event;
          if (code === 'KeyI' && (ctrlKey || metaKey)) {
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL,
      ),

      // Underline: Ctrl+U / Cmd+U
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (event) => {
          const { code, ctrlKey, metaKey } = event;
          if (code === 'KeyU' && (ctrlKey || metaKey)) {
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL,
      ),

      // Strikethrough: Ctrl+Shift+S / Cmd+Shift+S
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (event) => {
          const { code, ctrlKey, metaKey, shiftKey } = event;
          if (code === 'KeyS' && (ctrlKey || metaKey) && shiftKey) {
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL,
      ),

      // Code: Ctrl+` / Cmd+`
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (event) => {
          const { code, ctrlKey, metaKey } = event;
          if (code === 'Backquote' && (ctrlKey || metaKey)) {
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    );
  }, [editor]);

  return null;
}