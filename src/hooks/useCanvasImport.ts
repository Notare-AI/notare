import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Canvas {
  id: string;
  title: string;
  is_public: boolean;
}

export const useCanvasImport = (user: User | null) => {
  const importCanvasById = useCallback(async (canvasId: string): Promise<Canvas> => {
    if (!user) {
      throw new Error("User not authenticated.");
    }
    
    // 1. Fetch the public canvas data
    const { data: publicCanvas, error: fetchError } = await supabase
      .from('canvases')
      .select('title, canvas_data')
      .eq('id', canvasId)
      .eq('is_public', true)
      .single();

    if (fetchError) {
      throw new Error(`Could not find the shared canvas: ${fetchError.message}`);
    }

    if (!publicCanvas || !publicCanvas.canvas_data) {
      throw new Error('Canvas not found or has no data to copy.');
    }

    // 2. Create a new canvas for the current user
    const newTitle = `Copy of ${publicCanvas.title}`;
    
    const { data: newCanvas, error: insertError } = await supabase
      .from('canvases')
      .insert({
        title: newTitle,
        canvas_data: publicCanvas.canvas_data,
        owner_id: user.id,
      })
      .select('id, title, is_public')
      .single();

    if (insertError) {
      throw new Error(`Failed to copy canvas: ${insertError.message}`);
    }

    if (!newCanvas) {
      throw new Error('No canvas data returned after creation');
    }

    return newCanvas as Canvas;
  }, [user]);

  return { importCanvasById };
};