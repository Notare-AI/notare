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
import TurndownService from 'turndown';
import Showdown from 'showdown';

const turndownService = new TurndownService();
const showdownConverter = new Showdown.Converter();

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
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const initialHtml = showdownConverter.makeHtml(initialContent);
      setHtmlContent(initialHtml);
      setIsLoading(false);
    }
  }, [isOpen, initialContent]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      const newMarkdown = turndownService.turndown(htmlContent).trim();
      const trimmedInitial = initialContent.trim();
      if (newMarkdown !== trimmedInitial && newMarkdown !== '') {
        onSave(newMarkdown);
      }
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    const newMarkdown = turndownService.turndown(htmlContent).trim();
    const trimmedInitial = initialContent.trim();
    if (newMarkdown !== trimmedInitial && newMarkdown !== '') {
      onSave(newMarkdown);
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
              value={htmlContent}
              onChange={setHtmlContent}
              className="w-full h-full flex flex-col"
              placeholder="Start writing..."
              isMarkdownInput={false}
            />
          </div>
        </div>
        <DialogFooter className="p-6 border-t bg-background rounded-b-lg">
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditorModal;