import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactFlow } from '@xyflow/react';
import TiptapEditor from '@/components/TiptapEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

const NoteEditor = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const { getNode, setNodes } = useReactFlow();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const node = getNode(nodeId!);
    if (node) {
      setContent(node.data.label || '');
      setIsLoading(false);
    } else {
      // If node not found, redirect back
      navigate('/dashboard');
    }
  }, [nodeId, getNode, navigate]);

  const handleSave = () => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, label: content } };
        }
        return n;
      })
    );
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Canvas
        </Button>
        <h1 className="text-xl font-semibold">Edit Note</h1>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </header>
      <div className="flex-grow p-8 overflow-auto">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-sm p-8">
          <TiptapEditor
            value={content}
            onChange={setContent}
            className="w-full min-h-[500px] flex flex-col"
            placeholder="Start writing..."
            isEditable={true}
            autoFocus={true}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;