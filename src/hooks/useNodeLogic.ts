import { useReactFlow } from '@xyflow/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { colorMap } from '@/lib/colors';
import { hexToHsl } from '@/lib/utils';

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
    const defaultStyles = {
      background: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
    };

    if (!color || color === 'default') {
      return defaultStyles;
    }

    if (colorMap[color]) {
      const themeColors = isDarkMode ? colorMap[color].dark : colorMap[color].light;
      return {
        background: themeColors.background,
        borderColor: themeColors.border,
      };
    }

    if (/^#[0-9A-F]{6}$/i.test(color)) {
      const hsl = hexToHsl(color);
      if (hsl) {
        const lightBg = `hsl(${hsl.h}, ${hsl.s}%, 95%)`;
        const darkBg = `hsl(${hsl.h}, ${hsl.s}%, 15%)`;
        return {
          background: isDarkMode ? darkBg : lightBg,
          borderColor: color,
        };
      }
    }

    return defaultStyles;
  }, [color, isDarkMode]);

  return {
    handleDelete,
    handleColorChange,
    handleZoomToNode,
    nodeStyles,
  };
};