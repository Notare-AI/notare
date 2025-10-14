import { useReactFlow, Handle, Position } from '@xyflow/react';
import { useState, useEffect, useMemo } from 'react';
import NodeToolbarComponent from './NodeToolbar';
import { colorMap } from '@/lib/colors';

interface CustomNodeData {
  label?: string;
  color?: string;
}

type CustomNodeProps = {
  id: string;
  data: CustomNodeData;
  selected?: boolean;
};

function CustomNode({ id, data, selected }: CustomNodeProps) {
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

  const nodeStyles = useMemo(() => {
    if (!data.color || !colorMap[data.color]) {
      return {
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      };
    }
    const themeColors = isDarkMode ? colorMap[data.color].dark : colorMap[data.color].light;
    return {
      backgroundColor: themeColors.background,
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
        className="border border-solid rounded-sm p-2.5"
        style={{
          color: 'hsl(var(--foreground))',
          backgroundColor: nodeStyles.backgroundColor,
          borderColor: nodeStyles.borderColor,
        }}
      >
        <div className="px-2 py-1 text-center">
          {data.label || 'New Node'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
    </>
  );
}

export default CustomNode;