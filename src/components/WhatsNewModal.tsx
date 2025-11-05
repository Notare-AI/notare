import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { updates } from '@/lib/updates';

interface WhatsNewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
}

const WhatsNewModal = ({ isOpen, onOpenChange, onClose }: WhatsNewModalProps) => {
  const handleClose = () => {
    onClose();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>What's New in Notare</DialogTitle>
          <DialogDescription>
            Here are the latest features we've added to improve your workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-4">
            {updates.map((update, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <update.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{update.title}</h4>
                  <p className="text-sm text-muted-foreground">{update.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Got It!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewModal;