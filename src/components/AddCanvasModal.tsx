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
      <DialogContent className="bg-white dark:bg-[#363636] text-black dark:text-white border-gray-200 dark:border-gray-500">
        <DialogHeader>
          <DialogTitle>Add canvas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="My title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-100 dark:bg-[#212121] border-2 border-gray-300 dark:border-gray-400 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-300 h-12 text-black dark:text-white"
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-gray-800 text-white hover:bg-gray-900 dark:bg-[#424242] dark:text-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500"
          >
            Add Canvas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCanvasModal;