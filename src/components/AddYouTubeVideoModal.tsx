import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AddYouTubeVideoModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddVideo: (url: string) => void;
  isAdding: boolean;
}

const AddYouTubeVideoModal = ({
  isOpen,
  onOpenChange,
  onAddVideo,
  isAdding,
}: AddYouTubeVideoModalProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (url.trim()) {
      onAddVideo(url.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add YouTube Video</DialogTitle>
          <DialogDescription>
            Paste a YouTube video URL below to add it to your canvas.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12"
            disabled={isAdding}
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!url.trim() || isAdding}
          >
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddYouTubeVideoModal;