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
import { useCanvasImport } from "@/hooks/useCanvasImport";

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
  
  // Use the new hook
  const { importCanvasById } = useCanvasImport(user);

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

  // 3. Handler for the modal (passed to Sidebar)
  const handleImportCanvasFromUrl = useCallback(async (url: string) => {
    const urlParts = url.split('/');
    const canvasId = urlParts.find(part => part.length === 36); // Simple heuristic for UUID
    
    if (!canvasId) {
      showError("Invalid URL. Please ensure it's a valid Notare public canvas link.");
      return false;
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
              
              {/* Removed Import Canvas Banner - now handled automatically in context */}

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