import { memo, useCallback } from 'react';
import { NodeResizer, Handle, Position, useReactFlow } from '@xyflow/react';
import { Youtube, ListChecks, Loader2 } from 'lucide-react';
import NodeToolbarComponent from './NodeToolbar';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { useAI } from '@/hooks/useAI';
import { showError } from '@/utils/toast';
import { Button } from './ui/button';

interface YouTubeVideoNodeData {
  videoId: string;
  transcript: string;
  color?: string;
}

type YouTubeVideoNodeProps = {
  id: string;
  data: YouTubeVideoNodeData;
  selected?: boolean;
};

const getId = () => `node_${+new Date()}_${Math.random().toString(36).substring(2, 9)}`;

function YouTubeVideoNode({ id, data, selected }: YouTubeVideoNodeProps) {
  const { handleDelete, handleColorChange, handleZoomToNode, nodeStyles } = useNodeLogic(id, data.color);
  const { extractKeyPoints, isGenerating } = useAI();
  const { setNodes, getNode } = useReactFlow();

  const handleExtractKeyPoints = useCallback(async () => {
    if (!data.transcript) {
      showError("No transcript available for this video.");
      return;
    }
    try {
      const { points, sources } = await extractKeyPoints(data.transcript);
      const content = points.map(p => `- ${p}`).join('\n');
      const reference = `\n\n---\n*Source: YouTube Video (ID: ${data.videoId})*`;
      
      const parentNode = getNode(id);
      if (!parentNode) return;

      const newNode = {
        id: getId(),
        type: 'keyPoints',
        position: {
          x: parentNode.position.x + (parentNode.width || 400) + 50,
          y: parentNode.position.y,
        },
        data: { 
          label: content + reference, 
          sources: sources.map(s => ({ ...s, fileName: `YouTube: ${data.videoId}` })),
          color: data.color,
        },
        style: { width: 400, height: 300 },
      };

      setNodes((nds) => nds.concat(newNode));

    } catch (e: any) {
      showError(e.message || 'Failed to extract key points.');
    }
  }, [data.transcript, data.videoId, data.color, extractKeyPoints, setNodes, getNode, id]);

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
          border: `2px solid ${selected ? '#FF0000' : nodeStyles.borderColor}`,
          background: nodeStyles.background,
        }}
        className="w-full h-full box-border flex flex-col rounded-lg overflow-hidden"
      >
        <NodeResizer isVisible={!!selected} minWidth={320} minHeight={240} keepAspectRatio />

        <div className="flex items-center justify-between p-2 border-b border-[hsl(var(--border))] bg-black/5 dark:bg-card-header rounded-t-[6px] cursor-move">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <Youtube size={14} className="text-red-500" />
            YouTube Video
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExtractKeyPoints}
            disabled={isGenerating}
            className="h-7 px-2"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ListChecks className="mr-2 h-4 w-4" />
            )}
            Extract Key Points
          </Button>
        </div>

        <div className="flex-grow relative bg-black">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${data.videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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