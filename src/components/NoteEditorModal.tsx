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
import { convertTipTapToLexical, isTipTapJSON, isLexicalJSON } from '@/lib/convertTipTapToLexical';

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
  const [editorState, setEditorState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      let contentToLoad = initialContent;
      
      if (isTipTapJSON(contentToLoad)) {
        contentToLoad = convertTipTapToLexical(JSON.parse(contentToLoad));
      } else if (!isLexicalJSON(contentToLoad)) {
        contentToLoad = JSON.stringify({
          root: {
            children: [{
              children: [{
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: initialContent,
                type: "text",
                version: 1
              }],
              direction: null,
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1
            }],
            direction: null,
            format: "",
            indent: 0,
            type: "root",
            version: 1
          }
        });
      }
      
      setEditorState(contentToLoad);
      setIsLoading(false);
    }
  }, [isOpen, initialContent]);

  const handleSave = () => {
    onSave(editorState);
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl w-full h-[90vh] flex flex-col bg-muted p-0">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading content...</p>
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
            <LexicalEditor
              initialValue={editorState}
              onChange={setEditorState}
            />
          </div>
        </div>
        <DialogFooter className="p-6 border-t bg-background rounded-b-lg">
          <Button onClick={() => onOpenChange(false)} variant="ghost">Cancel</Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditorModal;