import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfToggleButtonProps {
  onClick: () => void;
  isActive: boolean;
}

const PdfToggleButton = ({ onClick, isActive }: PdfToggleButtonProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        'bg-white text-black hover:bg-gray-200 border-gray-300 shadow-sm',
        isActive && 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
      )}
      title={isActive ? "Close PDF Viewer" : "Open PDF Viewer"}
    >
      <FileText size={20} />
    </Button>
  );
};

export default PdfToggleButton;