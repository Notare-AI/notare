import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';
import { NodeColorPicker } from './NodeColorPicker';
import { cn } from '@/lib/utils';

const ImageNode = ({ id, data, selected }) => {
  const headerStyle = data.color ? { backgroundColor: `${data.color}33` } : {};

  return (
    <>
      <NodeResizer isVisible={selected} minWidth={150} minHeight={100} />
      <div
        className={cn(
          "bg-card border rounded-lg shadow-md w-full h-full flex flex-col",
          selected && "ring-2 ring-ring"
        )}
        style={data.color && selected ? { borderColor: data.color } : {}}
      >
        <div
          className={cn(
            "flex items-center p-2 border-b border-[hsl(var(--border))] rounded-t-[6px] cursor-move handle",
            !data.color && "bg-black/5 dark:bg-card-header"
          )}
          style={headerStyle}
        >
          <span className="flex items-center gap-2 text-xs font-semibold">
            <ImageIcon size={14} />
            Image
          </span>
          <div className="flex-grow" />
          <NodeColorPicker nodeId={id} currentColor={data.color} />
        </div>
        <div className="p-2 flex-grow relative bg-card rounded-b-lg">
          {data.src ? (
            <img src={data.src} alt={data.alt || 'Canvas image'} className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-muted-foreground text-sm">No image source</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />
    </>
  );
};

export default memo(ImageNode);