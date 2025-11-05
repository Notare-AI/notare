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
import { getYouTubeVideoId } from '@/lib/youtube-utils';
import { showError } from '@/utils/toast';

interface AddYoutubeVideoModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddVideo: (videoId: string, title: string) => void;
}

const AddYoutubeVideoModal = ({
  isOpen,
  onOpenChange,
  onAddVideo,
}: AddYoutubeVideoModalProps) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      showError("Invalid YouTube URL. Please enter a valid link.");
      return;
    }

    if (!title.trim()) {
      showError("Please enter a title for the video.");
      return;
    }

    onAddVideo(videoId, title.trim());
    setUrl("");
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add YouTube Video</DialogTitle>
          <DialogDescription>
            Embed a YouTube video directly onto your canvas.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="video-url" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              YouTube Video URL
            </label>
            <Input
              id="video-url"
              placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-10 mt-2"
            />
          </div>
          <div>
            <label htmlFor="video-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Video Title
            </label>
            <Input
              id="video-title"
              placeholder="A descriptive title for your video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!url.trim() || !title.trim()}
          >
            Add Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddYoutubeVideoModal;