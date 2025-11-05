import { useRef, useEffect, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

interface UseCanvasHistoryProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  isInitializedRef: React.MutableRefObject<boolean>;
}

export const useCanvasHistory = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  isInitializedRef,
}: UseCanvasHistoryProps) => {
  const history = useRef<{ nodes: Node[]; edges: Edge[] }[]>([{ nodes: [], edges: [] }]);
  const historyIndex = useRef(0);
  const isUndoRedo = useRef(false);

  const setInitialHistory = useCallback((initialNodes: Node[], initialEdges: Edge[]) => {
    history.current = [{ nodes: initialNodes, edges: initialEdges }];
    historyIndex.current = 0;
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex.current > 0) {
      isUndoRedo.current = true;
      const newIndex = historyIndex.current - 1;
      historyIndex.current = newIndex;
      const state = history.current[newIndex];
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      isUndoRedo.current = true;
      const newIndex = historyIndex.current + 1;
      historyIndex.current = newIndex;
      const state = history.current[newIndex];
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [setNodes, setEdges]);

  // Update history when nodes or edges change, unless it's an undo/redo action
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    const newHistory = history.current.slice(0, historyIndex.current + 1);
    newHistory.push({ nodes, edges });
    history.current = newHistory;
    historyIndex.current = newHistory.length - 1;
  }, [nodes, edges, isInitializedRef]);

  return { handleUndo, handleRedo, setInitialHistory };
};