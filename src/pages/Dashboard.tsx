import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import FlowDiagram from "@/components/FlowDiagram";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, FileText, Copy, Loader2 } from "lucide-react";
import PdfViewerSidebar from "@/components/PdfViewerSidebar";
import PdfToggleButton from "@/components/PdfToggleButton";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useHighlight } from "@/contexts/HighlightContext";
import SettingsModal from "@/components/SettingsModal";
import { showSuccess, showLoading, dismissToast, showError } from "@/utils/toast";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { supabase } from "@/integrations/supabase/client";
import WhatsNewModal from "@/components/WhatsNewModal";
import { LATEST_UPDATE_VERSION } from "@/lib/updates";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Canvas {
  id: string;
  title: string;
  is_public: boolean;
}

interface NewNodeRequest {
  type: string;
  content: string;
  sources?: string[];
}

const Index = () => {
  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isPdfSidebarOpen, setIsPdfSidebarOpen } = useHighlight();
  const [newNodeRequest, setNewNodeRequest] = useState<NewNodeRequest | null>(
    null,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('account');
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refetchProfile } = useUserProfile();
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [sidebarRefetchTrigger, setSidebarRefetchTrigger] = useState(0);
  const [canvasToImportId, setCanvasToImportId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Core logic for importing a canvas by ID
  const importCanvasById = useCallback(async (canvasId: string) => {
    if (!user) {
      throw new Error("User not authenticated.");
    }
    
    // 1. Fetch the public canvas data
    const { data: publicCanvas, error: fetchError } = await supabase
      .from('canvases')
      .select('title, canvas_data')
      .eq('id', canvasId)
      .eq('is_public', true)
      .single();

    if (fetchError) {
      throw new Error(`Could not find the shared canvas: ${fetchError.message}`);
    }

    if (!publicCanvas || !publicCanvas.canvas_data) {
      throw new Error('Canvas not found or has no data to copy.');
    }

    // 2. Create a new canvas for the current user
    const newTitle = `Copy of ${publicCanvas.title}`;
    
    const { data: newCanvas, error: insertError } = await supabase
      .from('canvases')
      .insert({
        title: newTitle,
        canvas_data: publicCanvas.canvas_data,
        owner_id: user.id,
      })
      .select('id, title, is_public')
      .single();

    if (insertError) {
      throw new Error(`Failed to copy canvas: ${insertError.message}`);
    }

    if (!newCanvas) {
      throw new Error('No canvas data returned after creation');
    }

    return newCanvas;
  }, [user]);

  // 1. Check for update version on load
  useEffect(() => {
    const seenVersion = localStorage.getItem('notare-update-version');
    if (seenVersion !== LATEST_UPDATE_VERSION) {
      setIsWhatsNewOpen(true);
    }
  }, []);

  // 2. Check for session verification (Stripe)
  useEffect(() => {
    const verifySession = async (sessionId: string) => {
      const toastId = showLoading('Finalizing your subscription...');
      try {
        const { error } = await supabase.functions.invoke('verify-checkout-session', {
          body: { session_id: sessionId },
        });

        if (error) {
          throw error;
        }

        await refetchProfile();
        dismissToast(toastId);
        showSuccess("Upgrade successful! Welcome to Pro.");

      } catch (error: any) {
        dismissToast(toastId);
        showError(error.message || 'Failed to verify your subscription. Please contact support.');
      } finally {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('session_id');
        setSearchParams(newParams, { replace: true });
      }
    };

    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifySession(sessionId);
    }
  }, [searchParams, setSearchParams, refetchProfile]);

  // 3. Check for canvas copy parameter (for banner display)
  useEffect(() => {
    const canvasIdFromUrl = searchParams.get('copyCanvas');
    if (canvasIdFromUrl) {
      setCanvasToImportId(canvasIdFromUrl);
    }
  }, [searchParams]);

  // 4. Handler for the banner button
  const handleImportCanvas = useCallback(async () => {
    if (!canvasToImportId || !user) return;

    setIsImporting(true);
    const toastId = showLoading('Copying canvas to your account...');
    
    try {
      const newCanvas = await importCanvasById(canvasToImportId);
      
      dismissToast(toastId);
      showSuccess('Canvas copied to your account!');
      
      setSelectedCanvas(newCanvas);
      setSidebarRefetchTrigger(prev => prev + 1); // Trigger sidebar refresh
      
    } catch (error: any) {
      console.error('Error in canvas copy:', error);
      dismissToast(toastId);
      showError(error.message);
    } finally {
      setIsImporting(false);
      setCanvasToImportId(null);
      // Clean up the URL parameter
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('copyCanvas');
      setSearchParams(newParams, { replace: true });
    }
  }, [canvasToImportId, user, searchParams, setSearchParams, importCanvasById]);

  // 5. Handler for the modal (passed to Sidebar)
  const handleImportCanvasFromUrl = useCallback(async (url: string) => {
    const urlParts = url.split('/');
    const canvasId = urlParts.find(part => part.length === 36); // Simple heuristic for UUID
    
    if (!canvasId) {
      showError("Invalid URL. Please ensure it's a valid Notare public canvas link.");
      return;
    }

    const toastId = showLoading('Importing canvas...');
    try {
      const newCanvas = await importCanvasById(canvasId);
      
      dismissToast(toastId);
      showSuccess('Canvas imported successfully!');
      
      setSelectedCanvas(newCanvas);
      setSidebarRefetchTrigger(prev => prev + 1); // Trigger sidebar refresh
      return true;
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || 'Failed to import canvas.');
      return false;
    }
  }, [importCanvasById]);

  const handleAddNode = (nodeData: NewNodeRequest) => {
    setNewNodeRequest(nodeData);
  };

  const openSettings = (tab: 'account' | 'billing' | 'theme' = 'account') => {
    setActiveSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const handleCloseWhatsNew = () => {
    localStorage.setItem('notare-update-version', LATEST_UPDATE_VERSION);
    setIsWhatsNewOpen(false);
  };

  return (
    <>
      <div className="flex h-screen w-screen bg-background text-foreground">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onCollapse={() => setIsSidebarCollapsed(true)}
          selectedCanvasId={selectedCanvas?.id || null}
          onSelectCanvas={(canvas) => setSelectedCanvas(canvas as Canvas)}
          onUpgradeClick={() => openSettings('billing')}
          onSettingsClick={openSettings}
          refetchTrigger={sidebarRefetchTrigger}
          onImportCanvasFromUrl={handleImportCanvasFromUrl}
        />
        <ResizablePanelGroup direction="horizontal" className="flex-grow">
          <ResizablePanel defaultSize={isPdfSidebarOpen ? 70 : 100}>
            <main className="flex-grow flex flex-col relative h-full">
              {isSidebarCollapsed && (
                <div className="flex items-center p-2 border-b border-border flex-shrink-0 h-[57px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="mr-2 hover:bg-muted"
                  >
                    <PanelLeftOpen size={20} />
                  </Button>
                  {selectedCanvas && (
                    <div className="flex items-center gap-2 text-foreground">
                      <FileText size={16} />
                      <span className="font-medium">{selectedCanvas.title}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Import Canvas Banner */}
              {canvasToImportId && (
                <div className="p-2 border-b border-border flex-shrink-0">
                  <Alert className="bg-primary/10 border-primary/20 text-primary">
                    <Copy className="h-4 w-4" />
                    <AlertTitle>Canvas Shared With You</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                      <span>Click below to import a copy of this public canvas into your account.</span>
                      <Button 
                        onClick={handleImportCanvas} 
                        disabled={isImporting}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isImporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        Import Canvas
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex-grow">
                {selectedCanvas ? (
                  <FlowDiagram
                    canvasId={selectedCanvas.id}
                    key={selectedCanvas.id}
                    newNodeRequest={newNodeRequest}
                    onNodeAdded={() => setNewNodeRequest(null)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Select a canvas to start or create a new one.</p>
                  </div>
                )}
              </div>

              <div className="fixed top-4 right-4 z-20">
                <PdfToggleButton
                  onClick={() => setIsPdfSidebarOpen(!isPdfSidebarOpen)}
                  isActive={isPdfSidebarOpen}
                />
              </div>
            </main>
          </ResizablePanel>
          {isPdfSidebarOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={28} maxSize={50}>
                <PdfViewerSidebar
                  canvasId={selectedCanvas?.id || null}
                  onAddNode={handleAddNode}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
        activeTab={activeSettingsTab}
      />
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onOpenChange={setIsWhatsNewOpen}
        onClose={handleCloseWhatsNew}
      />
    </>
  );
};

export default Index;