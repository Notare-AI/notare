import {
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as React from 'react';

function HorizontalRuleComponent() {
  return <hr className="my-4 border-border" />;
}

export type SerializedHorizontalRuleNode = Spread<
  {
    type: 'horizontalrule';
    version: 1;
  },
  SerializedLexicalNode
>;

export class HorizontalRuleNode extends DecoratorNode<React.ReactNode> {
  static getType(): string {
    return 'horizontalrule';
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(
    serializedNode: SerializedHorizontalRuleNode,
  ): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      type: 'horizontalrule',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    const theme = config.theme;
    const className = theme.hr;
    if (className !== undefined) {
      div.className = className;
    }
    return div;
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): false {
    return false;
  }

  decorate(): React.ReactNode {
    return <HorizontalRuleComponent />;
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return new HorizontalRuleNode();
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode;
}