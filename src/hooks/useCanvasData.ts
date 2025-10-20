import { useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface UseCanvasDataProps {
  canvasId: string;
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  setInitialHistory: (nodes: Node[], edges: Edge[]) => void;
}

export const useCanvasData = ({
  canvasId,
  nodes,
  edges,
  setNodes,
  setEdges,
  setInitialHistory,
}: UseCanvasDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // Fetch canvas data on canvasId change
  useEffect(() => {
    if (!canvasId) return;

    isInitializedRef.current = false;
    setIsLoading(true);

    const fetchCanvasData = async () => {
      const { data, error } = await supabase
        .from('canvases')
        .select('canvas_data')
        .eq('id', canvasId)
        .single();

      if (error) {
        showError('Failed to load canvas data.');
        console.error(error);
        setIsLoading(false);
        return;
      }

      if (data && data.canvas_data) {
        const { nodes: dbNodes = [], edges: dbEdges = [] } = data.canvas_data as { nodes: Node[], edges: Edge[] };
        const typedNodes = dbNodes.map(n => ({ ...n, type: n.type || 'editableNote' })); // Default to editableNote
        setNodes(typedNodes);
        setEdges(dbEdges);
        setInitialHistory(typedNodes, dbEdges);
      } else {
        setNodes([]);
        setEdges([]);
        setInitialHistory([], []);
      }
      setIsLoading(false);
      setTimeout(() => {
        isInitializedRef.current = true;
      }, 100);
    };

    fetchCanvasData();
  }, [canvasId, setNodes, setEdges, setInitialHistory]);

  // Debounced saving of canvas data
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        const canvas_data = { nodes, edges };
        const { error } = await supabase
          .from('canvases')
          .update({ canvas_data })
          .eq('id', canvasId);

        if (error) throw error;
      } catch (error: any) {
        showError(error.message || 'Failed to auto-save canvas.');
        console.error('Auto-save error:', error);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, canvasId]);

  return { isLoading, isInitializedRef };
};