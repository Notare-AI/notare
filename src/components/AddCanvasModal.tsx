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

interface AddCanvasModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddCanvas: (title: string) => void;
}

const AddCanvasModal = ({
  isOpen,
  onOpenChange,
  onAddCanvas,
}: AddCanvasModalProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onAddCanvas(title.trim());
      setTitle("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add canvas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="My title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12"
          />
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
            disabled={!title.trim()}
          >
            Add Canvas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCanvasModal;