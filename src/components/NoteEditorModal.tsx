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

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  const handleSave = () => {
    onSave(content);
    onOpenChange(false);
  };

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