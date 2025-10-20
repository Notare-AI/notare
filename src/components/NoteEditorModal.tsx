import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TiptapEditor from './TiptapEditor';

interface NoteEditorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentContent: string;
  onLiveUpdate: (newContent: string) => void;
  onSave: (newContent: string) => void;
  nodeId: string;
}

const NoteEditorModal = ({
  isOpen,
  onOpenChange,
  currentContent,
  onLiveUpdate,
  onSave,
  nodeId,
}: NoteEditorModalProps) => {
  const [localContent, setLocalContent] = useState(currentContent);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Small delay to ensure the editor is ready
      setTimeout(() => {
        setLocalContent(currentContent);
        setIsLoading(false);
      }, 100);
    }
  }, [isOpen, currentContent]);

  useEffect(() => {
    // Sync external changes to local state while modal is open
    if (isOpen && currentContent !== localContent) {
      setLocalContent(currentContent);
    }
  }, [currentContent, isOpen]);

  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent);
    onLiveUpdate(newContent);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      const trimmedContent = localContent.trim();
      const trimmedCurrent = currentContent.trim();
      if (trimmedContent !== trimmedCurrent && trimmedContent !== '') {
        onSave(trimmedContent);
      }
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    const trimmedContent = localContent.trim();
    if (trimmedContent !== currentContent.trim() && trimmedContent !== '') {
      onSave(trimmedContent);
    }
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-3xl w-full h-[90vh] flex flex-col bg-muted p-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading content...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl w-full h-[90vh] flex flex-col bg-muted p-0">
        <DialogHeader className="p-6 border-b bg-background rounded-t-lg">
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Make changes to your note content. Changes will be saved to the canvas.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow p-4 md:p-8 overflow-y-auto">
          <div className="bg-background shadow-sm rounded-md w-full h-full p-6 md:p-10">
            <TiptapEditor
              value={localContent}
              onChange={handleContentChange}
              className="w-full h-full flex flex-col"
              placeholder="Start writing..."
            />
          </div>
        </div>
        <DialogFooter className="p-6 border-t bg-background rounded-b-lg">
          <Button
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditorModal;