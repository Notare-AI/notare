import { useState, useEffect, useRef, memo } from 'react';
import { NodeResizer, Handle, Position, useReactFlow } from '@xyflow/react';
import { Quote, Pencil } from 'lucide-react';
import NodeToolbarComponent from './NodeToolbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { useCanvasActions } from '@/contexts/CanvasActionsContext';

interface ReferenceNodeData {
  label: string;
  color?: string;
}

type ReferenceNodeProps = {
  id: string;
  data: ReferenceNodeData;
  selected?: boolean;
};

function ReferenceNode({ id, data, selected }: ReferenceNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const { setNodes } = useReactFlow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { handleDelete, handleColorChange, handleZoomToNode, handleDownloadAsMarkdown, nodeStyles } = useNodeLogic(id, data.color);
  const { downloadNodeBranch } = useCanvasActions();

  useEffect(() => {
    setLabel(data.label || '');
  }, [data.label]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, label]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (label !== data.label) {
      setNodes((nodes) =>
        nodes.map((n) => {
          if (n.id === id) {
            n.data = { ...n.data, label };
          }
          return n;
        })
      );
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      handleBlur();
      return;
    }
    if (event.key === 'Escape') {
      setIsEditing(false);
      setLabel(data.label || '');
    }
  };

  return (
    <>
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <NodeToolbarComponent
        isVisible={selected}
        onDelete={handleDelete}
        onColorChange={handleColorChange}
        onZoomToNode={handleZoomToNode}
        onDownload={() => handleDownloadAsMarkdown(data.label)}
        onDownloadBranch={() => downloadNodeBranch(id)}
      />
      <div
        style={{
          border: selected ? '2px solid #9CA3AF' : `1px solid ${nodeStyles.borderColor}`,
          color: 'hsl(var(--foreground))',
          background: nodeStyles.background,
        }}
        className="w-full h-full box-border flex flex-col rounded-lg"
      >
        <NodeResizer isVisible={selected} minWidth={200} minHeight={100} />

        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-[hsl(var(--border))] bg-black/5 dark:bg-card-header rounded-t-[7px]">
          <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
            <Quote size={14} />
            Reference
          </span>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="p-1 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
                title="Edit reference"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow p-3 overflow-y-auto" onDoubleClick={handleEditClick}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="nodrag prose prose-sm dark:prose-invert max-w-none w-full h-full bg-transparent border-none resize-none outline-none p-0 m-0 block"
              style={{ overflowWrap: 'break-word', overflow: 'hidden' }}
            />
          ) : (
            <div className={cn(
                'prose prose-sm w-full h-full max-w-none dark:prose-invert',
                !label && 'text-gray-500 dark:text-gray-400'
              )}>
              {label ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {label}
                </ReactMarkdown>
              ) : (
                'Double click or use the edit icon to add text...'
              )}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
    </>
  );
}

export default memo(ReferenceNode);