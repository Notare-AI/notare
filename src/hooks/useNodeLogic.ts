import { useReactFlow } from '@xyflow/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { colorMap } from '@/lib/colors';
import { lexicalToMarkdown } from '@/lib/lexicalToMarkdown';
import { isLexicalJSON } from '@/lib/convertTipTapToLexical';

const generateFilename = (content: string) => {
  if (!content) {
    return 'note.md';
  }
  const sanitized = content
    .substring(0, 30)
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  return `${sanitized || 'note'}.md`;
};

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

  const handleDownloadAsMarkdown = useCallback((content: string) => {
    const markdownContent = isLexicalJSON(content) ? lexicalToMarkdown(content) : content;
    const filename = generateFilename(markdownContent);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const nodeStyles = useMemo(() => {
    if (!color || !colorMap[color]) {
      return {
        background: 'hsl(var(--note-background))',
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
    handleDownloadAsMarkdown,
    nodeStyles,
  };
};