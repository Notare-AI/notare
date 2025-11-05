import { useCallback, useRef, useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { useDnD } from '@/components/DnDContext';
import { useNodeCreation } from './useNodeCreation';

interface UseCanvasDragAndDropProps {
  onNodeAdded: () => void;
}

export const useCanvasDragAndDrop = ({ onNodeAdded }: UseCanvasDragAndDropProps) => {
  const { screenToFlowPosition } = useReactFlow();
  const [contextType, setType] = useDnD();
  const [isDragOver, setIsDragOver] = useState(false);
  const dragLeaveTimer = useRef<number | null>(null);
  const { addNode } = useNodeCreation({ setNodes: () => {}, onNodeAdded }); // setNodes will be passed from FlowCanvas

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    if (dragLeaveTimer.current) {
      clearTimeout(dragLeaveTimer.current);
      dragLeaveTimer.current = null;
    }
    
    if ((contextType || event.dataTransfer.types.includes('text/plain')) && !isDragOver) {
      setIsDragOver(true);
    }
  }, [contextType, isDragOver]);

  const onDrop = useCallback(
    (event: React.DragEvent, setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void) => {
      event.preventDefault();
      setIsDragOver(false);
      
      if (dragLeaveTimer.current) {
        clearTimeout(dragLeaveTimer.current);
        dragLeaveTimer.current = null;
      }

      // Read type from dataTransfer (reliable)
      let type = event.dataTransfer.getData('text/plain');
      
      // Fallback to context if dataTransfer is empty
      if (!type && contextType) {
        type = contextType;
      }

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Use the addNode function from useNodeCreation, passing the setNodes from FlowCanvas
      addNode(type, '', position);
      setType(null); // Reset DnD context type after drop
    },
    [screenToFlowPosition, contextType, addNode, setType]
  );

  const onDragLeave = useCallback(() => {
    dragLeaveTimer.current = window.setTimeout(() => {
      setIsDragOver(false);
    }, 100);
  }, []);

  return { onDragOver, onDrop, onDragLeave, isDragOver };
};