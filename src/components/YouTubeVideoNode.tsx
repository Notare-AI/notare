import { NodeResizer, Handle, Position } from '@xyflow/react';
import { Youtube, Loader2 } from 'lucide-react';
import NodeToolbarComponent from './NodeToolbar';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { useState, memo } from 'react';

interface YouTubeVideoNodeData {
  videoId: string;
  title?: string;
  color?: string;
}

type YouTubeVideoNodeProps = {
  id: string;
  data: YouTubeVideoNodeData;
  selected?: boolean;
};

function YouTubeVideoNode({ id, data, selected }: YouTubeVideoNodeProps) {
  const { handleDelete, handleColorChange, handleZoomToNode, nodeStyles } = useNodeLogic(id, data.color);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/${data.videoId}?autoplay=0&modestbranding=1&rel=0`;
  const borderColor = selected ? '#EF4444' : nodeStyles.borderColor; // YouTube red for selected border

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
        <NodeResizer isVisible={!!selected} minWidth={280} minHeight={180} keepAspectRatio />

        <div className="flex items-center p-2 border-b border-[hsl(var(--border))] bg-black/5 dark:bg-card-header rounded-t-[6px] cursor-move">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <Youtube size={14} className="text-red-500" />
            {data.title || 'YouTube Video'}
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
              Could not load video. Check the URL.
            </div>
          )}
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title={data.title || "YouTube video player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{ display: isLoading || hasError ? 'none' : 'block' }}
            className="nodrag"
          ></iframe>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
    </>
  );
}

export default memo(YouTubeVideoNode);