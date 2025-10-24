import { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAI } from '@/hooks/useAI';
import { Send, MessageSquare, Loader2, X, Bot, PlusSquare } from 'lucide-react';
import { showError } from '@/utils/toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCanvasActions } from '@/contexts/CanvasActionsContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NodeAIEditorProps {
  nodeId: string;
  currentContent: string;
  chatHistory?: Message[];
  onHistoryChange: (history: Message[]) => void;
}

const NodeAIEditor = ({ nodeId, currentContent, chatHistory, onHistoryChange }: NodeAIEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { generateNodeChatResponse, isGenerating } = useAI();
  const { addNodeFromMessage } = useCanvasActions();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages(chatHistory || [{ role: 'assistant', content: "Hello! How can I help you with this note?" }]);
      setPrompt('');
    }
  }, [isOpen, chatHistory]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div');
      if (scrollElement) {
        scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMessage: Message = { role: 'user', content: prompt };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPrompt('');

    try {
      const responseText = await generateNodeChatResponse(currentContent, newMessages);
      const assistantMessage: Message = { role: 'assistant', content: responseText };
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      onHistoryChange(finalMessages);
    } catch (error) {
      showError('Failed to get AI response.');
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white"
          title="Chat about this note"
        >
          <MessageSquare size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-96 bg-[#2A2A2A] border-gray-700 text-white p-0 flex flex-col h-[500px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-700 flex-shrink-0">
          <p className="text-sm font-medium">Chat with Note</p>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={14} />
          </Button>
        </div>
        
        <ScrollArea className="flex-grow p-3" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-gray-600">
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "group relative max-w-[80%] rounded-lg px-3 py-2 text-sm prose prose-sm prose-invert max-w-none break-all",
                  message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#363636]'
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-white/10"
                      onClick={() => addNodeFromMessage(message.content, nodeId)}
                      title="Add to canvas"
                    >
                      <PlusSquare size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 bg-gray-600">
                  <AvatarFallback><Bot size={18} /></AvatarFallback>
                </Avatar>
                <div className="bg-[#363636] rounded-lg px-3 py-2 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask about your note..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleSendMessage()}
              disabled={isGenerating}
              className="bg-[#363636] border-gray-500 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-gray-400 h-9"
            />
            <Button onClick={handleSendMessage} disabled={isGenerating || !prompt.trim()} size="icon" className="h-9 w-9 bg-gray-600 hover:bg-gray-500">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NodeAIEditor;