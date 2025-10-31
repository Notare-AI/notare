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
import LexicalEditor from './lexical/LexicalEditor';

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
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Focus Mode</DialogTitle>
          <DialogDescription>
            Edit your note in a distraction-free environment.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow py-4 overflow-y-auto -mx-6 px-6">
          <LexicalEditor
            initialValue={content}
            onChange={setContent}
            isEditable={true}
            showToolbar={true}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save and Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditorModal;