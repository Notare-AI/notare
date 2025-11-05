import { useState, useEffect, useCallback, memo } from 'react';
import { NodeResizer, Handle, Position, useReactFlow } from '@xyflow/react';
import NodeToolbarComponent from './NodeToolbar';
import { Pen, Eye } from 'lucide-react';
import { useHighlight } from '@/contexts/HighlightContext';
import NodeAIEditor from './NodeAIEditor';
import { cn } from '@/lib/utils';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { useCanvasActions } from '@/contexts/CanvasActionsContext';
import LexicalEditor from './lexical/LexicalEditor';
import FloatingToolbar from './lexical/FloatingToolbar';
import { convertTipTapToLexical, isTipTapJSON, isLexicalJSON } from '@/lib/convertTipTapToLexical';

interface Source {
  text: string;
  page: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface EditableNoteData {
  label: string;
  sources?: Source[];
  color?: string;
  isAiGenerated?: boolean;
  chatHistory?: Message[];
}

type EditableNoteProps = {
  id: string;
  data: EditableNoteData;
  selected?: boolean;
};

function EditableNoteNode({ id, data, selected }: EditableNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const { setNodes } = useReactFlow();
  const { highlightedText, setHighlightedText, isPdfSidebarOpen, setIsPdfSidebarOpen, setTargetPage } = useHighlight();
  const { handleDelete: originalHandleDelete, handleColorChange, handleZoomToNode, handleDownloadAsMarkdown, nodeStyles } = useNodeLogic(id, data.color);
  const { downloadNodeBranch } = useCanvasActions();

  const title = data.isAiGenerated ? 'AI Note' : 'Note';

  // Disable node dragging when editing starts, and re-enable it when it ends.
  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          n.draggable = !isEditing;
        }
        return n;
      })
    );
  }, [id, isEditing, setNodes]);

  // Exit edit mode when the node is deselected
  useEffect(() => {
    if (!selected && isEditing) {
      setIsEditing(false);
    }
  }, [selected, isEditing]);

  // Allow starting edit with the "Enter" key on a selected node
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selected && event.key === 'Enter' && !isEditing) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          setIsEditing(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selected, isEditing]);

  const getLexicalContent = (content: string) => {
    if (isTipTapJSON(content)) {
      return convertTipTapToLexical(JSON.parse(content));
    }
    if (!isLexicalJSON(content)) {
      return JSON.stringify({
        root: {
          children: [{
            children: [{ detail: 0, format: 0, mode: "normal", style: "", text: content, type: "text", version: 1 }],
            direction: null, format: "", indent: 0, type: "paragraph", version: 1
          }],
          direction: null, format: "", indent: 0, type: "root", version: 1
        }
      });
    }
    return content;
  };

  const handleContentChange = useCallback((newContent: string) => {
    // This updates the node state, which is then auto-saved by the useCanvasData hook.
    setNodes((nodes) =>
      nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: newContent } } : n))
    );
  }, [id, setNodes]);

  const handleChatHistoryChange = useCallback((newHistory: Message[]) => {
    setNodes((nodes) =>
      nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, chatHistory: newHistory } } : n))
    );
  }, [id, setNodes]);

  const textsToHighlight = data.sources?.map(s => s.text) || [];
  const isCurrentlyHighlighted = JSON.stringify(highlightedText) === JSON.stringify(textsToHighlight);
  const isActive = isPdfSidebarOpen && isCurrentlyHighlighted;

  const handleViewSourcesClick = () => {
    const targetPage = data.sources?.[0]?.page;
    if (targetPage) setTargetPage(targetPage);
    if (!isPdfSidebarOpen) setIsPdfSidebarOpen(true);
    setHighlightedText(isCurrentlyHighlighted ? null : textsToHighlight);
  };

  const handleSelectionChange = useCallback((hasSelection: boolean, formats: Set<string>) => {
    setToolbarVisible(hasSelection);
    setActiveFormats(formats);
  }, []);

  const handleFormatCommand = useCallback((format: string) => {
    // Use the global function exposed by SelectionTrackingPlugin
    if ((window as any).lexicalFormat) {
      (window as any).lexicalFormat(format);
    }
  }, []);

  const handleDelete = () => {
    if (isCurrentlyHighlighted) setHighlightedText(null);
    originalHandleDelete();
  };

  return (
    <>
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <NodeToolbarComponent
        isVisible={selected && !isEditing}
        onDelete={handleDelete}
        onColorChange={handleColorChange}
        onZoomToNode={handleZoomToNode}
        onDownload={() => handleDownloadAsMarkdown(data.label)}
        onDownloadBranch={() => downloadNodeBranch(id)}
      />
      
      <FloatingToolbar
        isVisible={isEditing && toolbarVisible}
        onFormat={handleFormatCommand}
        activeFormats={activeFormats}
      />
      <div
        style={{
          border: selected ? `2px solid ${isEditing ? '#3B82F6' : '#9CA3AF'}` : `1px solid ${nodeStyles.borderColor}`,
          color: 'hsl(var(--foreground))',
          background: nodeStyles.background,
        }}
        className="w-full h-full box-border flex flex-col rounded-lg"
        onDoubleClick={() => setIsEditing(true)}
      >
        <NodeResizer isVisible={selected} minWidth={200} minHeight={150} />

        <div className="flex items-center justify-between p-2 border-b border-border bg-card-header rounded-t-[7px] cursor-move">
          <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
            <Pen size={14} />
            {title}
          </span>
          <div className="flex items-center gap-1">
            {data.sources && data.sources.length > 0 && (
              <button onClick={handleViewSourcesClick} className={cn("p-1 text-muted-foreground rounded hover:bg-accent hover:text-accent-foreground", isActive && "bg-blue-500/10 text-blue-600 dark:text-blue-300")} title="View sources in PDF"><Eye size={16} /></button>
            )}
            <NodeAIEditor
              nodeId={id}
              currentContent={data.label}
              chatHistory={data.chatHistory}
              onHistoryChange={handleChatHistoryChange}
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-3">
          <LexicalEditor
            initialValue={getLexicalContent(data.label || '')}
            onChange={handleContentChange}
            isEditable={isEditing}
            onSelectionChange={handleSelectionChange}
            onFormatCommand={handleFormatCommand}
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

export default memo(EditableNoteNode);