import { NodeResizer, Handle, Position } from '@xyflow/react';
import { useHighlight } from '@/contexts/HighlightContext';
import NodeToolbarComponent from './NodeToolbar';
import NodeAIEditor from './NodeAIEditor';
import { Eye, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { useAutoResizeNode } from '@/hooks/useAutoResizeNode';
import { useCanvasActions } from '@/contexts/CanvasActionsContext';

interface Source {
  text: string;
  page: number;
}

interface TldrNodeData {
  label: string;
  sources: Source[];
  color?: string;
}

type TldrNodeProps = {
  id: string;
  data: TldrNodeData;
  selected?: boolean;
};

function TldrNode({ id, data, selected }: TldrNodeProps) {
  const { highlightedText, setHighlightedText, isPdfSidebarOpen, setIsPdfSidebarOpen, setTargetPage } = useHighlight();
  const { handleDelete: originalHandleDelete, handleColorChange, handleZoomToNode, handleDownloadAsMarkdown, nodeStyles } = useNodeLogic(id, data.color);
  const contentRef = useAutoResizeNode(id, data.label);
  const { downloadNodeBranch, openNodeInEditor } = useCanvasActions();

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
          border: selected ? '2px solid #9F46FF' : `1px solid ${nodeStyles.borderColor}`,
          color: 'hsl(var(--foreground))',
          background: nodeStyles.background,
        }}
        className="w-full h-full box-border flex flex-col rounded-lg"
      >
        <NodeResizer isVisible={selected} minWidth={200} minHeight={150} />

        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-[hsl(var(--border))] bg-black/5 dark:bg-card-header rounded-t-[7px]">
          <span className="px-2 py-1 text-xs font-semibold text-white bg-[#9F46FF]/30 border border-[#9F46FF] rounded">
            TLDR
          </span>
          <div className="flex items-center gap-1">
            {data.sources && data.sources.length > 0 && (
              <button
                onClick={handleViewSourcesClick}
                className={cn(
                  "p-1 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white",
                  isActive && "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300"
                )}
                title="View sources in PDF"
              >
                <Eye size={16} />
              </button>
            )}
            <button
              onClick={() => openNodeInEditor(id, data.label)}
              className="p-1 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
              title="Open in editor"
            >
              <Expand size={16} />
            </button>
            <NodeAIEditor nodeId={id} currentContent={data.label} />
          </div>
        </div>

        {/* Body */}
        <div ref={contentRef} className="flex-grow p-3 overflow-y-auto text-sm" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
    </>
  );
}

export default TldrNode;