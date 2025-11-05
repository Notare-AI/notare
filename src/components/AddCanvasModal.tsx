import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Loader2 } from "lucide-react";

interface AddCanvasModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddCanvas: (title: string) => Promise<boolean>;
  onImportCanvasFromUrl: (url: string) => Promise<boolean>;
}

const AddCanvasModal = ({
  isOpen,
  onOpenChange,
  onAddCanvas,
  onImportCanvasFromUrl,
}: AddCanvasModalProps) => {
  const [newCanvasTitle, setNewCanvasTitle] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [activeTab, setActiveTab] = useState('new');
  const [isLoading, setIsLoading] = useState(false);

  const handleNewCanvasSubmit = async () => {
    if (!newCanvasTitle.trim()) return;
    setIsLoading(true);
    const success = await onAddCanvas(newCanvasTitle.trim());
    if (success) {
      setNewCanvasTitle("");
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  const handleImportSubmit = async () => {
    if (!importUrl.trim()) return;
    setIsLoading(true);
    const success = await onImportCanvasFromUrl(importUrl.trim());
    if (success) {
      setImportUrl("");
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewCanvasTitle("");
      setImportUrl("");
      setActiveTab('new');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create or Import Canvas</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Canvas</TabsTrigger>
            <TabsTrigger value="import">Import from URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="py-4">
            <div className="space-y-4">
              <Input
                placeholder="My new research project"
                value={newCanvasTitle}
                onChange={(e) => setNewCanvasTitle(e.target.value)}
                className="h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleNewCanvasSubmit()}
                disabled={isLoading}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNewCanvasSubmit}
                disabled={!newCanvasTitle.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Canvas'}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="import" className="py-4">
            <div className="space-y-4">
              <Input
                placeholder="Paste public canvas URL here..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleImportSubmit()}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Link size={16} />
                Only public canvas links (e.g., /canvas/view/...) are supported.
              </p>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportSubmit}
                disabled={!importUrl.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Import Canvas'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddCanvasModal;