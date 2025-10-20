import { useState, useEffect } from 'react';
import { useReactFlow, NodeResizer, Handle, Position } from '@xyflow/react';
import NodeToolbarComponent from './NodeToolbar';
import { Pen, Eye, Expand } from 'lucide-react';
import { useHighlight } from '@/contexts/HighlightContext';
import NodeAIEditor from './NodeAIEditor';
import { cn } from '@/lib/utils';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { useAutoResizeNode } from '@/hooks/useAutoResizeNode';
import { useCanvasActions } from '@/contexts/CanvasActionsContext';
import TiptapEditor from './TiptapEditor';

interface Source {
  text: string;
  page: number;
}

interface EditableNoteData {
  label: string;
  sources?: Source[];
  color?: string;
  isAiGenerated?: boolean;
}

type EditableNoteProps = {
  id: string;
  data: EditableNoteData;
  selected?: boolean;
};

function EditableNoteNode({ id, data, selected }: EditableNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const { setNodes } = useReactFlow();
  const { highlightedText, setHighlightedText, isPdfSidebarOpen, setIsPdfSidebarOpen, setTargetPage } = useHighlight();
  const { handleDelete: originalHandleDelete, handleColorChange, handleZoomToNode, handleDownloadAsMarkdown, nodeStyles } = useNodeLogic(id, data.color);
  const contentRef = useAutoResizeNode(id, data.label);
  const { downloadNodeBranch, openNodeInEditor } = useCanvasActions();

  const title = data.isAiGenerated ? 'AI Note' : 'Note';

  useEffect(() => {
    setLabel(data.label || '');
  }, [data.label]);

  useEffect(() => {
    if (!selected && isEditing) {
      setIsEditing(false);
    }
  }, [selected, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (label !== data.label) {
      setNodes((nodes) =>
        nodes.map((n) => {
          if (n.id === id) {
            return { ...n, data: { ...n.data, label } };
          }
          return n;
        })
      );
    }
  };

  const handleDoubleClick = () => {
    if (selected) {
      setIsEditing(true);
    }
  };

  const textsToHighlight = data.sources?.map(s => s.text) || [];
  const isCurrentlyHighlighted = JSON.stringify(highlightedText) === JSON.stringify(textsToHighlight);
  const isActive = isPdfSidebarOpen && isCurrentlyHighlighted;

  const handleViewSourcesClick = () => {
    const targetPage = data.sources?.[0]?.page;
    if (targetPage) {
      setTargetPage(targetPage);
    }

    if (!isPdfSidebarOpen) {
      setIsPdfSidebarOpen(true);
      setHighlightedText(textsToHighlight);
      return;
    }
    if (isCurrentlyHighlighted) {
      setHighlightedText(null);
    } else {
      setHighlightedText(textsToHighlight);
    }
  };

  const handleDelete = () => {
    if (isCurrentlyHighlighted) {
      setHighlightedText(null);
    }
    originalHandleDelete();
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
        onDoubleClick={handleDoubleClick}
      >
        <NodeResizer isVisible={selected} minWidth={200} minHeight={150} />

        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-border bg-card-header rounded-t-[7px] cursor-move">
          <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
            <Pen size={14} />
            {title}
          </span>
          <div className="flex items-center gap-1">
            {data.sources && data.sources.length > 0 && (
              <button
                onClick={handleViewSourcesClick}
                className={cn(
                  "p-1 text-muted-foreground rounded hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-blue-500/10 text-blue-600 dark:text-blue-300"
                )}
                title="View sources in PDF"
              >
                <Eye size={16} />
              </button>
            )}
            <button
              onClick={() => openNodeInEditor(id, data.label)}
              className="p-1 text-muted-foreground rounded hover:bg-accent hover:text-accent-foreground"
              title="Open in editor"
            >
              <Expand size={16} />
            </button>
            <NodeAIEditor nodeId={id} currentContent={data.label} />
          </div>
        </div>

        {/* Body */}
        <div
          ref={contentRef}
          className={cn(
            'flex-grow overflow-y-auto',
            { 'cursor-grab': !isEditing }
          )}
        >
          <TiptapEditor
            value={label}
            onChange={setLabel}
            onBlur={handleBlur}
            isEditable={isEditing}
            placeholder={!label ? 'Double-click to edit...' : ''}
            className="w-full h-full flex flex-col"
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

export default EditableNoteNode;