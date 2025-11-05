import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactFlow, Background, BackgroundVariant, Node, Edge, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, PenSquare, Lock, Copy, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomNode from '@/components/CustomNode';
import EditableNoteNode from '@/components/EditableNoteNode';
import TldrNode from '@/components/TldrNode';
import KeyPointsNode from '@/components/KeyPointsNode';
import ReferenceNode from '@/components/ReferenceNode';
import ImageNode from '@/components/ImageNode';
import YouTubeVideoNode from '@/components/YouTubeVideoNode';
import CustomAnimatedEdge from '@/components/CustomAnimatedEdge';
import { CanvasActionsProvider } from '@/contexts/CanvasActionsContext'; // Import the provider

import '@xyflow/react/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
  editableNote: EditableNoteNode,
  tldr: TldrNode,
  keyPoints: KeyPointsNode,
  reference: ReferenceNode,
  image: ImageNode,
  youtubeVideo: YouTubeVideoNode,
};

const edgeTypes = {
  customAnimated: CustomAnimatedEdge,
};

const FitViewUpdater = () => {
  const { fitView } = useReactFlow();
  useEffect(() => {
    fitView({ duration: 800 });
  }, [fitView]);
  return null;
};

// Dummy actions for read-only public view
const dummyCanvasActions = {
  downloadNodeBranch: () => console.log('Download disabled in public view'),
  addNodeFromMessage: () => console.log('Add node disabled in public view'),
};

const PublicCanvas = () => {
  const { canvasId } = useParams();
  const [canvasData, setCanvasData] = useState<{ title: string; nodes: Node[]; edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [nodeCount, setNodeCount] = useState(0);

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCanvas = async () => {
      if (!canvasId) {
        setError('No canvas ID provided.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('canvases')
        .select('title, canvas_data')
        .eq('id', canvasId)
        .eq('is_public', true)
        .single();

      if (fetchError || !data) {
        setError('This canvas is not public or does not exist.');
        setLoading(false);
        return;
      }

      const { nodes = [], edges = [] } = data.canvas_data as { nodes: Node[], edges: Edge[] };
      setCanvasData({ title: data.title, nodes, edges });
      setNodeCount(nodes.length);
      setLoading(false);
    };

    fetchCanvas();
  }, [canvasId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-center">
        <Lock size={48} className="text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button asChild className="mt-6">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-border bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <PenSquare size={24} className="text-primary" />
          <div className="flex flex-col">
            <h1 className="font-bold text-lg truncate">{canvasData?.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Public Canvas
              </Badge>
              <Badge variant="outline" className="text-xs">
                {nodeCount} nodes
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Different CTAs based on user state */}
        {!user ? (
          <Button asChild size="lg" className="shadow-md">
            <Link 
              to={`/login?copyCanvas=${canvasId}`} 
              className="flex items-center gap-2"
              onClick={() => console.log('🚀 Anonymous user clicking sign up with canvasId:', canvasId)}
            >
              <Sparkles className="w-4 h-4" />
              Sign Up & Copy This Canvas
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" variant="outline">
            <Link 
              to={`/dashboard?copyCanvas=${canvasId}`} 
              className="flex items-center gap-2"
              onClick={() => console.log('👤 Logged-in user clicking copy with canvasId:', canvasId)}
            >
              <Copy className="w-4 h-4" />
              Copy to My Account
            </Link>
          </Button>
        )}
      </header>

      <div className="flex-grow relative">
        <ReactFlowProvider>
          <CanvasActionsProvider value={dummyCanvasActions}>
            <ReactFlow
              nodes={canvasData?.nodes}
              edges={canvasData?.edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{ hideAttribution: true }}
              className="bg-background"
            >
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <FitViewUpdater />
            </ReactFlow>
          </CanvasActionsProvider>
        </ReactFlowProvider>

        {/* Enhanced CTA for anonymous users */}
        {!user && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <Card className="w-96 shadow-2xl border-2">
              <CardHeader className="text-center pb-3">
                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Love this canvas?
                </CardTitle>
                <CardDescription>
                  Sign up for free to copy this canvas to your account and start building on it!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>✨ Full editing capabilities</span>
                  <span>🤖 AI-powered features</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>📚 Unlimited canvases</span>
                  <span>🔗 Share with others</span>
                </div>
                <Button asChild className="w-full mt-4" size="lg">
                  <Link to={`/login?copyCanvas=${canvasId}`} className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Get Started - Copy This Canvas
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Free forever • No credit card required
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCanvas;