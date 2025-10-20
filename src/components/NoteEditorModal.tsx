import { useState, useEffect, useRef } from 'react';
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
  const [isDirty, setIsDirty] = useState(false); // NEW: Track if user has made changes in modal
  const lastSavedContent = useRef(initialContent); // NEW: Track the last saved content to detect external changes

  // Initialize content when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const initialHtml = showdownConverter.makeHtml(initialContent);
      setHtmlContent(initialHtml);
      lastSavedContent.current = initialContent; // Reset last saved
      setIsDirty(false); // Reset dirty flag on open
      setIsLoading(false);
    }
  }, [isOpen]); // Note: Removed initialContent from deps to avoid resetting on prop change

  // NEW: Sync from canvas to modal if prop changes while open (but only if not dirty)
  useEffect(() => {
    if (isOpen && initialContent !== lastSavedContent.current && !isDirty) {
      // Canvas updated externally while modal is open, and user hasn't edited yet
      const newHtml = showdownConverter.makeHtml(initialContent);
      setHtmlContent(newHtml);
      lastSavedContent.current = initialContent; // Update last saved
    }
    // If dirty, we ignore the update to prevent overwriting user's unsaved changes
  }, [initialContent, isOpen, isDirty]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      const newMarkdown = turndownService.turndown(htmlContent).trim();
      const trimmedInitial = lastSavedContent.current.trim(); // Use last saved to compare
      if (newMarkdown !== trimmedInitial && newMarkdown !== '') {
        onSave(newMarkdown);
        lastSavedContent.current = newMarkdown; // Update last saved after save
      }
      setIsDirty(false); // Reset dirty on close
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    const newMarkdown = turndownService.turndown(htmlContent).trim();
    const trimmedInitial = lastSavedContent.current.trim();
    if (newMarkdown !== trimmedInitial && newMarkdown !== '') {
      onSave(newMarkdown);
      lastSavedContent.current = newMarkdown;
    }
    onOpenChange(false);
    setIsDirty(false);
  };

  const handleContentChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    setIsDirty(true); // Mark as dirty when user edits
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
              onChange={handleContentChange} // Updated to mark dirty
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