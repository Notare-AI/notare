import { NodeResizer, Handle, Position, useReactFlow } from '@xyflow/react';
import { Image as ImageIcon, Loader2, MessageSquarePlus } from 'lucide-react';
import NodeToolbarComponent from './NodeToolbar';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { useState, memo, useRef } from 'react';
import AnnotationPin from './AnnotationPin';

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
}

interface ImageNodeData {
  src: string;
  alt?: string;
  color?: string;
  annotations?: Annotation[];
}

type ImageNodeProps = {
  id: string;
  data: ImageNodeData;
  selected?: boolean;
};

function ImageNode({ id, data, selected }: ImageNodeProps) {
  const { setNodes } = useReactFlow();
  const { handleDelete, handleColorChange, handleZoomToNode, nodeStyles } = useNodeLogic(id, data.color);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const borderColor = selected ? '#3B82F6' : nodeStyles.borderColor;

  const updateAnnotations = (newAnnotations: Annotation[]) => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, annotations: newAnnotations } };
        }
        return n;
      })
    );
  };

  const handleAddAnnotation = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotating || !imageWrapperRef.current) return;
    event.stopPropagation();

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newAnnotation: Annotation = {
      id: `anno_${Date.now()}`,
      x,
      y,
      text: '',
    };

    const newAnnotations = [...(data.annotations || []), newAnnotation];
    updateAnnotations(newAnnotations);
  };

  const handleUpdateAnnotation = (annotationId: string, text: string) => {
    const newAnnotations = (data.annotations || []).map((anno) =>
      anno.id === annotationId ? { ...anno, text } : anno
    );
    updateAnnotations(newAnnotations);
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    const newAnnotations = (data.annotations || []).filter(
      (anno) => anno.id !== annotationId
    );
    updateAnnotations(newAnnotations);
  };

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

        <div className="flex items-center justify-between p-2 border-b border-[hsl(var(--border))] bg-black/5 dark:bg-card-header rounded-t-[6px] cursor-move">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <ImageIcon size={14} />
            Image
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${isAnnotating ? 'bg-blue-500/20 text-blue-400' : ''}`}
            onClick={() => setIsAnnotating(!isAnnotating)}
            title={isAnnotating ? 'Disable Annotations' : 'Enable Annotations'}
          >
            <MessageSquarePlus size={14} />
          </Button>
        </div>

        <div
          ref={imageWrapperRef}
          className={`flex-grow relative bg-black/5 ${isAnnotating ? 'cursor-crosshair' : ''}`}
          onClick={handleAddAnnotation}
        >
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
            className="w-full h-full object-contain pointer-events-none"
            style={{ display: isLoading || hasError ? 'none' : 'block' }}
          />
          
          {!isLoading && !hasError && data.annotations?.map(anno => (
            <AnnotationPin
              key={anno.id}
              annotation={anno}
              onUpdate={handleUpdateAnnotation}
              onDelete={handleDeleteAnnotation}
            />
          ))}
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