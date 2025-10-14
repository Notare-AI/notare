import { useState } from 'react';
import { useReactFlow, addEdge } from '@xyflow/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAI } from '@/hooks/useAI';
import { Send, MessageSquare, Loader2, X } from 'lucide-react';
import { showError } from '@/utils/toast';

interface NodeAIEditorProps {
  nodeId: string;
  currentContent: string;
}

const NodeAIEditor = ({ nodeId, currentContent }: NodeAIEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const { getNode, setNodes, setEdges } = useReactFlow();
  const { generateUpdatedNodeContent, isGenerating } = useAI();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const newContent = await generateUpdatedNodeContent(currentContent, prompt);
      
      const parentNode = getNode(nodeId);
      if (!parentNode) {
        showError('Could not find the source node.');
        return;
      }

      const newNodePosition = {
        x: parentNode.position.x + (parentNode.width || 200) + 50,
        y: parentNode.position.y,
      };

      const newNodeId = `node_${+new Date()}`;
      const newNode = {
        id: newNodeId,
        type: 'editableNote',
        position: newNodePosition,
        data: { 
          label: newContent,
          color: parentNode.data.color, // Preserve color from parent
          isAiGenerated: true,
        },
        style: { ...parentNode.style }, // Preserve style from parent
      };

      const newEdge = {
        id: `e-${nodeId}-${newNodeId}`,
        source: nodeId,
        target: newNodeId,
        type: 'customAnimated',
        animated: true,
      };

      setNodes((nodes) => nodes.concat(newNode));
      setEdges((edges) => addEdge(newEdge, edges));

      setIsOpen(false);
      setPrompt('');
    } catch (error) {
      showError('Failed to update node with AI.');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white"
          title="Generate from this node"
        >
          <MessageSquare size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="start" 
        className="w-80 bg-[#2A2A2A] border-gray-700 text-white p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <p className="text-sm font-medium">How may I help you?</p>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={14} />
          </Button>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
              disabled={isGenerating}
              className="bg-[#363636] border-gray-500 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-gray-400 h-9"
            />
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} size="icon" className="h-9 w-9 bg-gray-600 hover:bg-gray-500">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NodeAIEditor;