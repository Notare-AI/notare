import { useCallback } from 'react';
import { Node, useReactFlow } from '@xyflow/react';

let idCounter = 0;
const getId = () => `node_${+new Date()}_${idCounter++}`;

interface Source {
  text: string;
  page: number;
}

interface NewNodeRequest {
  type: string;
  content: string;
  sources?: Source[];
}

const getNodeTypeFromRequest = (requestType: string): string => {
  switch (requestType) {
    case 'TLDR':
      return 'tldr';
    case 'Key Points':
    case 'Key Points (AI)':
      return 'keyPoints';
    case 'Reference':
      return 'reference';
    case 'Note':
    case 'AI Note':
      return 'editableNote';
    default:
      return 'editableNote';
  }
};

interface UseNodeCreationProps {
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  onNodeAdded: () => void;
}

export const useNodeCreation = ({ setNodes, onNodeAdded }: UseNodeCreationProps) => {
  const { screenToFlowPosition, fitView } = useReactFlow();

  const addNode = useCallback((
    type: string,
    content: string,
    position: { x: number; y: number },
    sources: Source[] = [],
    isAiGenerated: boolean = false,
    parentNodeId?: string, // Optional: for AI-generated nodes
    parentNodeColor?: string, // Optional: for AI-generated nodes
    parentNodeStyle?: React.CSSProperties, // Optional: for AI-generated nodes
  ) => {
    const newNode: Node = {
      id: getId(),
      type: getNodeTypeFromRequest(type),
      position,
      data: { 
        label: content, 
        sources: sources,
        isAiGenerated: isAiGenerated,
        color: parentNodeColor, // Apply parent color if available
      },
      style: { width: 400, height: 300, ...parentNodeStyle }, // Apply parent style if available
      selected: true,
    };

    setNodes((nds) => nds.map(n => ({...n, selected: false})).concat(newNode));
    onNodeAdded();

    setTimeout(() => {
      fitView({ nodes: [{ id: newNode.id }], duration: 500, padding: 0.2 });
    }, 100);

    return newNode; // Return the newly created node
  }, [setNodes, onNodeAdded, fitView]);

  const addNodeFromRequest = useCallback((newNodeRequest: NewNodeRequest) => {
    const { type, content, sources } = newNodeRequest;
    const position = screenToFlowPosition({
      x: window.innerWidth * 0.4,
      y: window.innerHeight / 3,
    });
    addNode(type, content, position, sources);
  }, [addNode, screenToFlowPosition]);

  const addNodeOnPaneClick = useCallback((event: React.MouseEvent) => {
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    addNode('Note', '', position);
  }, [addNode, screenToFlowPosition]);

  return { addNode, addNodeFromRequest, addNodeOnPaneClick };
};