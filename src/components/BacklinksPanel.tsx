import { useState, useEffect } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { Link } from 'lucide-react';
import { isLexicalJSON } from '@/lib/convertTipTapToLexical';
import { lexicalToMarkdown } from '@/lib/lexicalToMarkdown';
import { cn } from '@/lib/utils';

interface BacklinksPanelProps {
  selectedNodeId: string | null;
}

const getReadableTitle = (label: string | undefined): string => {
  if (!label) {
    return 'Untitled Note';
  }
  if (isLexicalJSON(label)) {
    const markdown = lexicalToMarkdown(label);
    const firstLine = markdown.split('\n')[0].replace(/^[#\s*>-]+/, '').trim();
    return firstLine || 'Untitled Note';
  }
  return label.split('\n')[0] || 'Untitled Note';
};

const BacklinksPanel = ({ selectedNodeId }: BacklinksPanelProps) => {
  const [backlinks, setBacklinks] = useState<Node[]>([]);
  const [recentlyClicked, setRecentlyClicked] = useState<string | null>(null);
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow();

  useEffect(() => {
    if (!selectedNodeId) {
      setBacklinks([]);
      return;
    }

    const allNodes = getNodes();
    const allEdges = getEdges();

    const incomingEdges = allEdges.filter(edge => edge.target === selectedNodeId);
    const backlinkNodes = incomingEdges
      .map(edge => allNodes.find(node => node.id === edge.source))
      .filter((node): node is Node => node !== undefined);
    
    setBacklinks(backlinkNodes);
  }, [selectedNodeId, getNodes, getEdges]);

  const handleBacklinkClick = (nodeId: string) => {
    // Provide visual feedback in the list
    setRecentlyClicked(nodeId);
    setTimeout(() => setRecentlyClicked(null), 1000);

    // Select the target node and ensure it's not hidden by viewport culling
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === nodeId,
        hidden: n.id === nodeId ? false : n.hidden,
      }))
    );

    // Use a timeout to ensure the node is rendered before fitting the view
    setTimeout(() => {
      fitView({ nodes: [{ id: nodeId }], duration: 800, padding: 0.2 });
    }, 0);
  };

  return (
    <div className="h-full w-full bg-card text-foreground flex flex-col">
      <div className="p-3 border-b border-border flex-shrink-0">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Link size={16} />
          Linked References
        </h3>
      </div>
      <div className="flex-grow overflow-y-auto p-3">
        {selectedNodeId ? (
          backlinks.length > 0 ? (
            <ul className="space-y-2">
              {backlinks.map(node => (
                <li key={node.id}>
                  <button
                    onClick={() => handleBacklinkClick(node.id)}
                    className={cn(
                      "w-full text-left text-sm p-2 rounded-md hover:bg-muted/50 transition-colors",
                      recentlyClicked === node.id && "bg-primary/10"
                    )}
                  >
                    {getReadableTitle(node.data.label)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground text-center mt-4">No linked references found.</p>
          )
        ) : (
          <p className="text-xs text-muted-foreground text-center mt-4">Select a note to see its backlinks.</p>
        )}
      </div>
    </div>
  );
};

export default BacklinksPanel;