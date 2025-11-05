import React from 'react';
import { NodeToolbar, Position } from '@xyflow/react';
import { Trash2, Palette, ZoomIn, Ban, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { colors } from '@/lib/colors';

interface NodeToolbarComponentProps {
  isVisible: boolean;
  onDelete: () => void;
  onColorChange: (color: string) => void;
  onZoomToNode: () => void;
  onDownload?: () => void;
  onDownloadBranch?: () => void;
}

function NodeToolbarComponent({ 
  isVisible, 
  onDelete, 
  onColorChange, 
  onZoomToNode,
  onDownload,
  onDownloadBranch
}: NodeToolbarComponentProps) {
  return (
    <NodeToolbar 
      isVisible={isVisible} 
      position={Position.Top}
      offset={10}
      className="flex items-center gap-1 p-1 bg-[#2A2A2A] rounded-lg shadow-lg border border-[#424242]"
    >
      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
        title="Delete node"
      >
        <Trash2 size={14} />
      </Button>

      {/* Color Picker Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
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
              onClick={() => onColorChange('default')}
              className="w-5 h-5 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center text-gray-400 hover:border-white hover:text-white transition-all"
              title="Remove color"
            >
              <Ban size={12} />
            </button>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className="w-5 h-5 rounded-full border-2 border-transparent hover:border-white transition-all"
                style={{ backgroundColor: color }}
                title={`Change color to ${color}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Download Button */}
      {onDownload && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
          title="Download as Markdown"
        >
          <Download size={14} />
        </Button>
      )}

      {/* Download Branch Button */}
      {onDownloadBranch && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownloadBranch}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
          title="Download branch as Markdown"
        >
          <Share2 size={14} />
        </Button>
      )}

      {/* Zoom to Node Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomToNode}
        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
        title="Zoom to node"
      >
        <ZoomIn size={14} />
      </Button>
    </NodeToolbar>
  );
}

export default NodeToolbarComponent;