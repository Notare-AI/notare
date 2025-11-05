import { Button } from '@/components/ui/button';
import { Link, Link2Off } from 'lucide-react';

interface BacklinksToggleButtonProps {
  onClick: () => void;
  isActive: boolean;
}

const BacklinksToggleButton = ({ onClick, isActive }: BacklinksToggleButtonProps) => {
  return (
    <button
      onClick={onClick}
      title={isActive ? "Hide Linked References" : "Show Linked References"}
      className="bg-card text-foreground w-8 h-8 flex items-center justify-center rounded-sm border border-border shadow-md hover:bg-muted"
    >
      {isActive ? <Link2Off size={16} /> : <Link size={16} />}
    </button>
  );
};

export default BacklinksToggleButton;