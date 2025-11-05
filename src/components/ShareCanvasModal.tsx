import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface Canvas {
  id: string;
  title: string;
  is_public: boolean;
}

interface ShareCanvasModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  canvas: Canvas | null;
  onCanvasUpdate: () => void;
}

const ShareCanvasModal = ({
  isOpen,
  onOpenChange,
  canvas,
  onCanvasUpdate,
}: ShareCanvasModalProps) => {
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const shareUrl = `${window.location.origin}/canvas/view/${canvas?.id}`;

  useEffect(() => {
    if (canvas) {
      setIsPublic(canvas.is_public);
    }
  }, [canvas]);

  const handleTogglePublic = async (checked: boolean) => {
    if (!canvas) return;
    setIsLoading(true);
    const { error } = await supabase
      .from('canvases')
      .update({ is_public: checked })
      .eq('id', canvas.id);

    if (error) {
      showError('Failed to update sharing settings.');
      setIsPublic(!checked); // Revert on error
    } else {
      showSuccess(checked ? 'Canvas is now public.' : 'Canvas is now private.');
      setIsPublic(checked);
      onCanvasUpdate();
    }
    setIsLoading(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showSuccess('Link copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{canvas?.title}"</DialogTitle>
          <DialogDescription>
            Anyone with the link can view a public canvas.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="public-switch"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isLoading}
            />
            <Label htmlFor="public-switch" className="flex items-center">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Make canvas public
            </Label>
          </div>
          {isPublic && (
            <div className="space-y-2 animate-in fade-in-0">
              <Label htmlFor="share-url">Shareable Link</Label>
              <div className="flex items-center gap-2">
                <Input id="share-url" value={shareUrl} readOnly />
                <Button size="icon" onClick={handleCopyLink}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCanvasModal;