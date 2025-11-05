import { useEffect, useRef, useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { useNodeCreation } from './useNodeCreation';
import { useImageUpload } from './useImageUpload';
import { Tool } from '@/components/CanvasToolbar';

interface UseCanvasKeyboardShortcutsProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  canvasId: string;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  onNodeAdded: () => void;
  setActiveTool: (tool: Tool) => void;
}

export const useCanvasKeyboardShortcuts = ({
  nodes,
  setNodes,
  setEdges,
  handleUndo,
  handleRedo,
  canvasId,
  reactFlowWrapper,
  onNodeAdded,
  setActiveTool,
}: UseCanvasKeyboardShortcutsProps) => {
  const clipboardRef = useRef<Node[]>([]);
  const { getNodes } = useReactFlow();
  const { addNode } = useNodeCreation({ setNodes, onNodeAdded });
  const { uploadAndAddImageNode } = useImageUpload({ canvasId, setNodes, reactFlowWrapper });

  const getId = useCallback(() => `node_${+new Date()}_${Math.random().toString(36).substring(2, 9)}`, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isUndo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.shiftKey;
      const isRedo = (event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey));

      if (isUndo) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if (isRedo) {
        event.preventDefault();
        handleRedo();
        return;
      }

      // Tool switching hotkeys
      switch (event.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'h':
          setActiveTool('pan');
          break;
        case 'n':
          setActiveTool('note');
          break;
      }

      const isCopy = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c';
      const isPaste = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v';

      if (isCopy) {
        const selectedNodes = getNodes().filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          clipboardRef.current = JSON.parse(JSON.stringify(selectedNodes));
        }
      }

      if (isPaste) {
        if (clipboardRef.current.length === 0) {
          // No nodes in our internal clipboard, so let the native paste event handle it (e.g., for images).
          return;
        }

        // We have nodes to paste, so handle it and prevent the native paste event.
        event.preventDefault();

        const pastedNodes = clipboardRef.current.map((node: Node) => {
          const newNode: Node = {
            ...node,
            id: getId(),
            position: {
              x: node.position.x + 25,
              y: node.position.y + 25,
            },
            selected: true,
          };
          return newNode;
        });

        setNodes((currentNodes) => [
          ...currentNodes.map(n => ({ ...n, selected: false })),
          ...pastedNodes
        ]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [getNodes, setNodes, setEdges, handleUndo, handleRedo, getId, setActiveTool]);

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (!canvasId) return;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const items = event.clipboardData?.items;
      if (!items) return;

      let imageFile: File | null = null;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          imageFile = item.getAsFile();
          break;
        }
      }

      if (!imageFile) return;

      event.preventDefault();
      await uploadAndAddImageNode(imageFile);
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [canvasId, uploadAndAddImageNode]);
};