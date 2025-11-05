import { NodeResizer, Handle, Position } from '@xyflow/react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import NodeToolbarComponent from './NodeToolbar';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { useState, memo } from 'react';

interface ImageNodeData {
  src: string;
  alt?: string;
  color?: string;
}

type ImageNodeProps = {
  id: string;
  data: ImageNodeData;
  selected?: boolean;
};

function ImageNode({ id, data, selected }: ImageNodeProps) {
  const { handleDelete, handleColorChange, handleZoomToNode, nodeStyles } = useNodeLogic(id, data.color);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const borderColor = selected ? '#3B82F6' : nodeStyles.borderColor;

  return (
    <>
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <NodeToolbarComponent
        isVisible={!!selected}
        onDelete={handleDelete}
        onColorChange={handleColorChange}
        onZoomToNode={handleZoomToNode}
      />
      <div
        style={{
          border: `2px solid ${borderColor}`,
          background: nodeStyles.background,
        }}
        className="w-full h-full box-border flex flex-col rounded-lg overflow-hidden"
      >
        <NodeResizer isVisible={!!selected} minWidth={100} minHeight={100} keepAspectRatio />

        <div className="flex items-center p-2 border-b border-[hsl(var(--border))] bg-black/5 dark:bg-card-header rounded-t-[6px] cursor-move">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <ImageIcon size={14} />
            Image
          </span>
        </div>

        <div className="flex-grow relative bg-black/5">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          )}
          {hasError && !isLoading && (
             <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500 p-2 text-center">
              Could not load image.
            </div>
          )}
          <img
            src={data.src}
            alt={data.alt || 'Pasted image'}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className="w-full h-full object-contain"
            style={{ display: isLoading || hasError ? 'none' : 'block' }}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
    </>
  );
}

export default memo(ImageNode);