import { useCallback } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';
import { showError, showSuccess } from '@/utils/toast';

interface UseCanvasActionsProps {
  nodes: Node[];
  edges: Edge[];
  setEditingNodeId: (nodeId: string | null) => void;
  setEditingNodeContent: (content: string) => void;
}

export const useCanvasActions = ({ nodes, edges, setEditingNodeId, setEditingNodeContent }: UseCanvasActionsProps) => {
  const downloadNodeBranch = useCallback((startNodeId: string) => {
    const startNode = nodes.find(n => n.id === startNodeId);
    if (!startNode) {
      showError("Could not find the starting node.");
      return;
    }

    const queue: string[] = [startNodeId];
    const visited = new Set<string>([startNodeId]);
    const branchNodes: Node[] = [startNode];

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      
      const connectedEdges = edges.filter(edge => edge.source === currentNodeId || edge.target === currentNodeId);

      for (const edge of connectedEdges) {
        const neighborId = edge.source === currentNodeId ? edge.target : edge.source;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
          const neighborNode = nodes.find(n => n.id === neighborId);
          if (neighborNode) {
            branchNodes.push(neighborNode);
          }
        }
      }
    }

    const textNodes = branchNodes.filter(n => n.type !== 'image');
    const startTextNode = textNodes.find(n => n.id === startNodeId);

    if (!startTextNode) {
        showError("The selected node has no text content to export.");
        return;
    }

    let markdownContent = `# ${startTextNode.data.label || 'Untitled Note'}\n\n`;
    
    const otherNodes = textNodes.filter(n => n.id !== startNodeId);

    otherNodes.forEach(node => {
      const title = node.data.label?.split('\n')[0] || 'Untitled';
      const type = node.type?.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()) || 'Note';
      markdownContent += `---\n\n## ${type}: ${title}\n\n${node.data.label || ''}\n\n`;
    });

    const filename = `${(startNode.data.label || 'canvas_branch').substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
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

    showSuccess("Branch downloaded successfully!");
  }, [nodes, edges]);

  const openNodeInEditor = useCallback((nodeId: string, content: string) => {
    const nodeToEdit = nodes.find(n => n.id === nodeId);
    if (nodeToEdit && typeof nodeToEdit.data.label === 'string') {
      setEditingNodeId(nodeId);
      setEditingNodeContent(content);
    } else {
      showError("Could not find node content to edit.");
    }
  }, [nodes, setEditingNodeId, setEditingNodeContent]);

  return { downloadNodeBranch, openNodeInEditor };
};