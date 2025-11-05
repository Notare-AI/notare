import { useRef } from 'react';
import { MousePointer, Hand, StickyNote, Image as ImageIcon, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type Tool = 'select' | 'pan' | 'note';

interface CanvasToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onImageUpload: (file: File) => void;
  onAddYoutubeVideo: () => void; // New prop for YouTube video
}

const CanvasToolbar = ({ activeTool, onToolChange, onImageUpload, onAddYoutubeVideo }: CanvasToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    // Reset file input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select (V)' },
    { id: 'pan', icon: Hand, label: 'Pan (H)' },
    { id: 'note', icon: StickyNote, label: 'Note (N)' },
  ];

  return (
    <>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background border rounded-lg shadow-lg p-1 flex items-center gap-1 z-10">
        <TooltipProvider>
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => onToolChange(tool.id as Tool)}
                >
                  <tool.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImageButtonClick}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Image</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAddYoutubeVideo}
              >
                <Youtube className="h-5 w-5 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add YouTube Video</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </>
  );
};

export default CanvasToolbar;