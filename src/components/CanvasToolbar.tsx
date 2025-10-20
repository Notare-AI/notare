import { MousePointer2, Hand, FilePlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDnD } from './DnDContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Tool = 'select' | 'pan' | 'note';

interface CanvasToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools = [
  { id: 'select' as const, icon: MousePointer2, label: 'Select', draggable: false, tooltip: 'Select and move items' },
  { id: 'pan' as const, icon: Hand, label: 'Pan', draggable: false, tooltip: 'Pan the canvas' },
  { id: 'note' as const, icon: FilePlus2, label: 'New Note', draggable: true, tooltip: 'Drag to add a new note' },
];

const CanvasToolbar = ({ activeTool, onToolChange }: CanvasToolbarProps) => {
  const [, setType] = useDnD();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType); // Set dataTransfer for reliable reading on drop
    event.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback to the drag image
    const dragElement = event.currentTarget as HTMLElement;
    dragElement.style.opacity = '0.5';
  };

  const onDragEnd = (event: React.DragEvent) => {
    setType(null);
    
    // Reset visual feedback
    const dragElement = event.currentTarget as HTMLElement;
    dragElement.style.opacity = '1';
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 p-1 bg-[#2A2A2A] rounded-lg shadow-lg">
        {tools.map((tool) => (
          <Tooltip key={tool.id} delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                key={tool.id}
                variant="ghost"
                size="icon"
                onClick={() => onToolChange(tool.id)}
                draggable={tool.draggable || false}
                onDragStart={(event) => tool.draggable && onDragStart(event, 'editableNote')}
                onDragEnd={onDragEnd}
                className={cn(
                  'h-10 w-10 rounded-md',
                  activeTool === tool.id
                    ? 'bg-gray-300 text-black hover:bg-gray-300'
                    : 'text-white hover:bg-gray-600 hover:text-white',
                  tool.draggable && 'cursor-grab active:cursor-grabbing'
                )}
                aria-label={tool.label}
              >
                <tool.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="bg-[#363636] text-white border-gray-500">
              <p>{tool.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default CanvasToolbar;