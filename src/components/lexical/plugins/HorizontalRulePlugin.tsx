import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';
import { $createHorizontalRuleNode } from '../nodes/HorizontalRuleNode';

export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void> =
  createCommand('INSERT_HORIZONTAL_RULE_COMMAND');

export default function HorizontalRulePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<void>(
      INSERT_HORIZONTAL_RULE_COMMAND,
      () => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const focusNode = selection.focus.getNode();
        if (focusNode !== null) {
          const horizontalRuleNode = $createHorizontalRuleNode();
          selection.insertParagraph();
          selection.focus
            .getNode()
            .getTopLevelElementOrThrow()
            .insertBefore(horizontalRuleNode);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}