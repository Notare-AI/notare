import { useEffect, useRef, useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { useNodeCreation } from './useNodeCreation';

interface UseCanvasKeyboardShortcutsProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  canvasId: string;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  onNodeAdded: () => void;
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
}: UseCanvasKeyboardShortcutsProps) => {
  const clipboardRef = useRef<Node[]>([]);
  const { getNodes, screenToFlowPosition } = useReactFlow();
  const { addNode } = useNodeCreation({ setNodes, onNodeAdded });

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
  }, [getNodes, setNodes, setEdges, handleUndo, handleRedo, getId]);

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
      const toastId = showLoading('Uploading image...');

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('You must be logged in to upload images.');

        const fileExt = imageFile.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${user.id}/${canvasId}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('canvas_images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('canvas_images').getPublicUrl(filePath);
        if (!publicUrl) throw new Error('Could not get public URL for the image.');

        const pane = reactFlowWrapper.current?.querySelector('.react-flow__pane');
        if (!pane) throw new Error("Could not determine paste location.");
        
        const { top, left, width, height } = pane.getBoundingClientRect();
        const position = screenToFlowPosition({ x: left + width / 2, y: top + height / 2 });

        const image = new Image();
        image.onload = () => {
          const aspectRatio = image.width / image.height;
          const defaultWidth = 300;
          const defaultHeight = defaultWidth / aspectRatio;

          const newNode: Node = {
            id: getId(), type: 'image', position,
            data: { src: publicUrl, alt: imageFile?.name },
            style: { width: defaultWidth, height: defaultHeight },
          };
          setNodes((nds) => nds.concat(newNode));
          dismissToast(toastId);
          showSuccess('Image pasted successfully!');
        };
        image.onerror = () => {
          const newNode: Node = {
            id: getId(), type: 'image', position,
            data: { src: publicUrl, alt: imageFile?.name },
            style: { width: 300, height: 200 },
          };
          setNodes((nds) => nds.concat(newNode));
          dismissToast(toastId);
          showSuccess('Image pasted successfully!');
        };
        image.src = publicUrl;

      } catch (error: any) {
        dismissToast(toastId);
        showError(error.message || 'Failed to paste image.');
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [canvasId, screenToFlowPosition, setNodes, getId, reactFlowWrapper]);
};