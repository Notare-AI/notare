import { useCallback } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

const getId = () => `node_${+new Date()}_${Math.random().toString(36).substring(2, 9)}`;

interface UseImageUploadProps {
  canvasId: string;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
}

export const useImageUpload = ({ canvasId, setNodes, reactFlowWrapper }: UseImageUploadProps) => {
  const { screenToFlowPosition } = useReactFlow();

  const uploadAndAddImageNode = useCallback(async (imageFile: File) => {
    if (!canvasId || !imageFile) return;

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
      if (!pane) throw new Error("Could not determine image location.");
      
      const { top, left, width, height } = pane.getBoundingClientRect();
      const position = screenToFlowPosition({ x: left + width / 2, y: top + height / 2 });

      const image = new Image();
      image.onload = () => {
        const aspectRatio = image.width / image.height;
        const defaultWidth = 400;
        const defaultHeight = defaultWidth / aspectRatio;

        const newNode: Node = {
          id: getId(), type: 'image', position,
          data: { src: publicUrl, alt: imageFile?.name },
          style: { width: defaultWidth, height: defaultHeight },
        };
        setNodes((nds) => nds.concat(newNode));
        dismissToast(toastId as string); // Cast to string
        showSuccess('Image uploaded successfully!');
      };
      image.onerror = () => {
        // Fallback size if image fails to load for dimensions check
        const newNode: Node = {
          id: getId(), type: 'image', position,
          data: { src: publicUrl, alt: imageFile?.name },
          style: { width: 400, height: 300 },
        };
        setNodes((nds) => nds.concat(newNode));
        dismissToast(toastId as string); // Cast to string
        showSuccess('Image uploaded successfully!');
      };
      image.src = publicUrl;

    } catch (error: any) {
      dismissToast(toastId as string); // Cast to string
      showError(error.message || 'Failed to upload image.');
    }
  }, [canvasId, screenToFlowPosition, setNodes, reactFlowWrapper]);

  return { uploadAndAddImageNode };
};