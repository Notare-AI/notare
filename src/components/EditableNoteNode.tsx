import { useState, useEffect, useRef, useMemo } from 'react';
import { useReactFlow, NodeResizer, Handle, Position } from '@xyflow/react';
import NodeToolbarComponent from './NodeToolbar';
import { Pen, Eye, Pencil } from 'lucide-react';
import { useHighlight } from '@/contexts/HighlightContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NodeAIEditor from './NodeAIEditor';
import { cn } from '@/lib/utils';
import { colorMap } from '@/lib/colors';

interface EditableNoteData {
  label: string;
  sources?: string[];
  color?: string;
}

type EditableNoteProps = {
  id: string;
  data: EditableNoteData;
  selected?: boolean;
};

function EditableNoteNode({ id, data, selected }: EditableNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const { setNodes, getNodes, fitView } = useReactFlow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { highlightedText, setHighlightedText, isPdfSidebarOpen, setIsPdfSidebarOpen } = useHighlight();
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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

  const handleDelete = (nodeId: string) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  };

  const handleColorChange = (nodeId: string, color: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const newData = { ...node.data };
          if (color === 'default') {
            delete newData.color;
          } else {
            newData.color = color;
          }
          return { ...node, data: newData };
        }
        return node;
      })
    );
  };

  const handleZoomToNode = (nodeId: string) => {
    const node = getNodes().find((n) => n.id === nodeId);
    if (node) {
      fitView({
        nodes: [node],
        duration: 800,
        padding: 0.2,
      });
    }
  };

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

  const isCurrentlyHighlighted = JSON.stringify(highlightedText) === JSON.stringify(data.sources);
  const isActive = isPdfSidebarOpen && isCurrentlyHighlighted;

  const handleViewSourcesClick = () => {
    if (!isPdfSidebarOpen) {
      setIsPdfSidebarOpen(true);
      setHighlightedText(data.sources || null);
      return;
    }
    if (isCurrentlyHighlighted) {
      setHighlightedText(null);
    } else {
      setHighlightedText(data.sources || null);
    }
  };

  const nodeStyles = useMemo(() => {
    if (!data.color || !colorMap[data.color]) {
      return {
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      };
    }
    const themeColors = isDarkMode ? colorMap[data.color].dark : colorMap[data.color].light;
    return {
      background: themeColors.background,
      borderColor: themeColors.border,
    };
  }, [data.color, isDarkMode]);

  return (
    <>
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <NodeToolbarComponent
        nodeId={id}
        isVisible={selected}
        onDelete={handleDelete}
        onColorChange={handleColorChange}
        onZoomToNode={handleZoomToNode}
      />
      <div
        style={{
          border: selected ? '2px solid #9CA3AF' : `1px solid ${nodeStyles.borderColor}`,
          color: 'hsl(var(--foreground))',
          background: nodeStyles.background,
        }}
        className="w-full h-full box-border flex flex-col rounded-lg"
      >
        <NodeResizer isVisible={selected} minWidth={200} minHeight={150} />

        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-[hsl(var(--border))] bg-black/5 dark:bg-card-header rounded-t-[7px] cursor-move">
          <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
            <Pen size={14} />
            Note
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
            <NodeAIEditor nodeId={id} currentContent={data.label} />
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="p-1 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
                title="Edit note"
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
            <div
              className={cn(
                'prose prose-sm w-full h-full max-w-none dark:prose-invert',
                !label && 'text-gray-500 dark:text-gray-400'
              )}
            >
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

export default EditableNoteNode;