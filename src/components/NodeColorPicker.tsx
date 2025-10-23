import { useReactFlow } from '@xyflow/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette, Ban } from 'lucide-react';
import { colors } from '@/lib/colors';
import { useCallback } from 'react';

interface NodeColorPickerProps {
  nodeId: string;
  currentColor?: string;
}

export const NodeColorPicker = ({ nodeId }: NodeColorPickerProps) => {
  const { setNodes } = useReactFlow();

  const handleColorChange = useCallback((newColor: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const newData = { ...node.data };
          if (newColor === 'default') {
            delete newData.color;
          } else {
            newData.color = newColor;
          }
          return { ...node, data: newData };
        }
        return node;
      })
    );
  }, [nodeId, setNodes]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
          title="Change color"
        >
          <Palette size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        className="w-auto p-2 bg-[#363636] border-gray-500"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex gap-1">
          <button
            onClick={() => handleColorChange('default')}
            className="w-5 h-5 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center text-gray-400 hover:border-white hover:text-white transition-all"
            title="Remove color"
          >
            <Ban size={12} />
          </button>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className="w-5 h-5 rounded-full border-2 border-transparent hover:border-white transition-all"
              style={{ backgroundColor: color }}
              title={`Change color to ${color}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};