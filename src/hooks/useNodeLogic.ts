import { useReactFlow } from '@xyflow/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { colorMap } from '@/lib/colors';

export const useNodeLogic = (nodeId: string, color?: string) => {
  const { setNodes, getNodes, fitView } = useReactFlow();
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  }, [nodeId, setNodes]);

  const handleColorChange = useCallback((newColor: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          const newData = { ...node.data };
          if (newColor === 'default') {
            delete newData.color;
          } else {
            newData.color = newColor;
          }
          return { ...node, data: newData };
        }
        return node;
      })
    );
  }, [nodeId, setNodes]);

  const handleZoomToNode = useCallback(() => {
    const node = getNodes().find((n) => n.id === nodeId);
    if (node) {
      fitView({
        nodes: [node],
        duration: 800,
        padding: 0.2,
      });
    }
  }, [nodeId, getNodes, fitView]);

  const nodeStyles = useMemo(() => {
    if (!color || !colorMap[color]) {
      return {
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      };
    }
    const themeColors = isDarkMode ? colorMap[color].dark : colorMap[color].light;
    return {
      background: themeColors.background,
      borderColor: themeColors.border,
    };
  }, [color, isDarkMode]);

  return {
    handleDelete,
    handleColorChange,
    handleZoomToNode,
    nodeStyles,
  };
};