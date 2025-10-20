import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Settings, ChevronLeft, ChevronRight, Search, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CanvasSettings from '@/components/CanvasSettings';
import FlowCanvas from '@/components/FlowCanvas';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useCanvasActions } from '@/hooks/useCanvasActions';
import { CanvasActionsProvider } from '@/contexts/CanvasActionsContext';

interface Canvas {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { canvasId } = useParams<{ canvasId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNodeRequest, setNewNodeRequest] = useState<null | { type: string; content: string; sources?: string[] }>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { subscriptionPlan, aiCredits } = useSubscription();

  useEffect(() => {
    if (user) {
      fetchCanvases();
    }
  }, [user]);

  const fetchCanvases = async () => {
    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('owner_id', user?.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch canvases",
        variant: "destructive",
      });
      return;
    }

    setCanvases(data || []);
    
    // If no canvasId in URL and there are canvases, navigate to the first one
    if (!canvasId && data?.length) {
      navigate(`/dashboard/${data[0].id}`);
    }
  };

  const createNewCanvas = async () => {
    if (!user) return;

    const canCreate = await supabase.functions.invoke('can_create_canvas', {
      body: { user_id: user.id }
    });

    if (!canCreate.data) {
      toast({
        title: "Limit Reached",
        description: "You've reached the maximum number of canvases for your plan. Upgrade to create more.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from('canvases')
      .insert({
        owner_id: user.id,
        title: 'New Canvas',
        canvas_data: { nodes: [], edges: [] }
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create new canvas",
        variant: "destructive",
      });
      return;
    }

    setCanvases([data, ...canvases]);
    navigate(`/dashboard/${data.id}`);
    toast({
      title: "Success",
      description: "New canvas created",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const filteredCanvases = canvases.filter(canvas => 
    canvas.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNodeAdded = () => {
    setNewNodeRequest(null);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col border-r border-border transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-14" : "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center p-2 border-b border-border text-foreground flex-shrink-0 h-[57px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="mr-2"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {!isSidebarCollapsed && (
            <h1 className="text-lg font-semibold truncate">My Canvases</h1>
          )}
        </div>

        {/* Search */}
        {!isSidebarCollapsed && (
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search canvases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
        )}

        {/* Canvas List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCanvases.map((canvas) => (
            <Tooltip key={canvas.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant={canvas.id === canvasId ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-8 px-2",
                    isSidebarCollapsed && "justify-center px-0"
                  )}
                  onClick={() => navigate(`/dashboard/${canvas.id}`)}
                >
                  {isSidebarCollapsed ? (
                    <FileIcon className="h-4 w-4" />
                  ) : (
                    <span className="truncate">{canvas.title}</span>
                  )}
                </Button>
              </TooltipTrigger>
              {!isSidebarCollapsed && (
                <TooltipContent side="right">
                  <div className="text-sm">
                    <p>Created: {new Date(canvas.created_at).toLocaleDateString()}</p>
                    <p>Updated: {new Date(canvas.updated_at).toLocaleDateString()}</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border flex-shrink-0">
          <div className={cn(
            "flex items-center justify-between",
            isSidebarCollapsed && "flex-col gap-2"
          )}>
            <Button
              variant="ghost"
              size={isSidebarCollapsed ? "icon" : "default"}
              onClick={createNewCanvas}
              className={cn(
                "flex-1",
                isSidebarCollapsed && "w-full"
              )}
            >
              <Plus className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="ml-2">New Canvas</span>}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          {!isSidebarCollapsed && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Plan: {subscriptionPlan}</p>
              <p>AI Credits: {aiCredits}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {canvasId ? (
          <CanvasActionsProvider>
            <FlowCanvas
              canvasId={canvasId}
              newNodeRequest={newNodeRequest}
              onNodeAdded={handleNodeAdded}
              onSettingsClick={handleSettingsClick}
            />
          </CanvasActionsProvider>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select or create a canvas to get started
          </div>
        )}
      </div>

      <CanvasSettings
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        canvasId={canvasId}
      />
    </div>
  );
};

export default Dashboard;