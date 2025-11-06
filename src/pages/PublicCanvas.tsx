import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ReactFlow, Background, BackgroundVariant, Node, Edge, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, PenSquare, Lock, Copy, Users, Sparkles, X } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const justSignedUp = searchParams.get('justSignedUp') === 'true';
  const [canvasData, setCanvasData] = useState<{ title: string; nodes: Node[]; edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [showCTACard, setShowCTACard] = useState(true);

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
          <div className="flex items-center gap-3">
            {justSignedUp && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4" />
                Welcome to Notare!
              </div>
            )}
            <Button asChild size="lg" variant={justSignedUp ? "default" : "outline"} className={justSignedUp ? "shadow-md animate-pulse" : ""}>
              <Link 
                to={`/dashboard?copyCanvas=${canvasId}`} 
                className="flex items-center gap-2"
                onClick={() => console.log('👤 Logged-in user clicking copy with canvasId:', canvasId)}
              >
                <Copy className="w-4 h-4" />
                {justSignedUp ? "Copy This Canvas Now!" : "Copy to My Account"}
              </Link>
            </Button>
          </div>
        )}
      </header>

      {/* Welcome banner for newly signed up users */}
      {user && justSignedUp && (
        <div className="bg-primary/10 border-b border-primary/20 p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">🎉 Welcome to Notare!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your account is ready! Click the button above to copy this canvas and start editing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary bg-primary/20 px-2 py-1 rounded">
                    <Copy className="w-3 h-3" />
                    Ready to copy
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
        {!user && showCTACard && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <Card className="w-96 shadow-2xl border-2">
              <CardHeader className="text-center pb-3 relative">
                <button
                  onClick={() => setShowCTACard(false)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
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

        {/* Minimized CTA button when card is closed */}
        {!user && !showCTACard && (
          <div className="absolute bottom-6 right-6 z-20">
            <Button
              onClick={() => setShowCTACard(true)}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Copy Canvas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCanvas;