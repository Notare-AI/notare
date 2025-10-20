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
  initialContent: string;
  onSave: (newContent: string) => void;
}

const NoteEditorModal = ({
  isOpen,
  onOpenChange,
  initialContent,
  onSave,
}: NoteEditorModalProps) => {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Small delay to ensure the editor is ready
      setTimeout(() => {
        setContent(initialContent);
        setIsLoading(false);
      }, 100);
    }
  }, [isOpen, initialContent]);

  const handleSave = () => {
    onSave(content);
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={content}
              onChange={setContent}
              className="w-full h-full flex flex-col"
              placeholder="Start writing..."
            />
          </div>
        </div>
        <DialogFooter className="p-6 border-t bg-background rounded-b-lg">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
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