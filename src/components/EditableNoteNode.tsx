import { useState, useEffect, useRef } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

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
  canvasId: string; // NEW: Added canvasId prop for saving
};

function EditableNoteNode({ id, data, selected, canvasId }: EditableNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const { setNodes, getNodes, getEdges } = useReactFlow(); // UPDATED: Added getNodes, getEdges
  const { highlightedText, setHighlightedText, isPdfSidebarOpen, setIsPdfSidebarOpen, setTargetPage } = useHighlight();
  const { handleDelete: originalHandleDelete, handleColorChange, handleZoomToNode, handleDownloadAsMarkdown, nodeStyles } = useNodeLogic(id, data.color);
  const contentRef = useAutoResizeNode(id, data.label);
  const { downloadNodeBranch, openNodeInEditor } = useCanvasActions();
  const justSavedRef = useRef(false);

  const title = data.isAiGenerated ? 'AI Note' : 'Note';

  useEffect(() => {
    if (!isEditing && !justSavedRef.current) {
      setLabel(data.label || '');
    }
    justSavedRef.current = false;
  }, [data.label, isEditing]);

  useEffect(() => {
    if (!selected && isEditing) {
      handleBlur();
      setIsEditing(false);
    }
  }, [selected, isEditing]);

  const handleBlur = async () => { // UPDATED: Made async and added immediate save
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

      // NEW: Immediate save to Supabase
      try {
        const canvas_data = { nodes: getNodes(), edges: getEdges() }; // Get latest state
        const { error } = await supabase
          .from('canvases')
          .update({ canvas_data })
          .eq('id', canvasId);

        if (error) throw error;
      } catch (error: any) {
        showError(error.message || 'Failed to save note changes.');
        console.error('Save error:', error);
      }
    }
  };

  const handleOpenInEditor = () => {
    if (isEditing && label !== data.label) {
      handleBlur();
    }
    setIsEditing(false);
    openNodeInEditor(id, label);
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

        <div className="flex items-center justify-between p-2 border-b border-border bg-card-header rounded-t-[7px] cursor-move">
          <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
            <Pen size={14} />
            {title}
          </span>
          <div className="flex items-center gap-1">
            {data.sources && data.sources.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewSourcesClick();
                }}
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
              onClick={(e) => {
                e.stopPropagation();
                handleOpenInEditor();
              }}
              className="p-1 text-muted-foreground rounded hover:bg-accent hover:text-accent-foreground"
              title="Open in editor"
            >
              <Expand size={16} />
            </button>
            <NodeAIEditor nodeId={id} currentContent={data.label} />
          </div>
        </div>

        <div
          ref={contentRef}
          className={cn(
            'flex-grow overflow-y-auto',
            { 'cursor-move': !isEditing },
            isEditing && 'cursor-text'
          )}
        >
          <TiptapEditor
            value={label}
            onChange={setLabel}
            placeholder={!label ? 'Double-click to edit...' : ''}
            className="w-full h-full flex flex-col"
            isEditable={isEditing}
            autoFocus={isEditing}
            isMarkdownInput={true}
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