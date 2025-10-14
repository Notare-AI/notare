import { NodeResizer, useReactFlow, Handle, Position } from '@xyflow/react';
import { useState, useEffect, useMemo } from 'react';
import { ListChecks, Eye } from 'lucide-react';
import { useHighlight } from '@/contexts/HighlightContext';
import NodeToolbarComponent from './NodeToolbar';
import NodeAIEditor from './NodeAIEditor';
import { cn } from '@/lib/utils';
import { colorMap } from '@/lib/colors';

interface KeyPointsNodeData {
  label: string;
  sources: string[];
  color?: string;
}

type KeyPointsNodeProps = {
  id: string;
  data: KeyPointsNodeData;
  selected?: boolean;
};

function KeyPointsNode({ id, data, selected }: KeyPointsNodeProps) {
  const { highlightedText, setHighlightedText, isPdfSidebarOpen, setIsPdfSidebarOpen } = useHighlight();
  const { setNodes, getNodes, fitView } = useReactFlow();
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
          border: selected ? '2px solid #3B82F6' : `1px solid ${nodeStyles.borderColor}`,
          color: 'hsl(var(--foreground))',
          background: nodeStyles.background,
        }}
        className="w-full h-full box-border flex flex-col rounded-lg"
      >
        <NodeResizer isVisible={selected} minWidth={200} minHeight={150} />

        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-[hsl(var(--border))] bg-black/5 dark:bg-card-header rounded-t-[7px]">
          <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-white bg-[#00112E] border border-[#3B82F6] rounded">
            <ListChecks size={14} />
            Key Points
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
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow p-3 overflow-y-auto text-sm" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
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

export default KeyPointsNode;