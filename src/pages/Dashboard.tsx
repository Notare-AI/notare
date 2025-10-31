import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FlowDiagram from "@/components/FlowDiagram";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, FileText } from "lucide-react";
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

interface Canvas {
  id: string;
  title: string;
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
  const { refetchProfile } = useUserProfile();

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

  const handleAddNode = (nodeData: NewNodeRequest) => {
    setNewNodeRequest(nodeData);
  };

  const openSettings = (tab: 'account' | 'billing' | 'theme' = 'account') => {
    setActiveSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  return (
    <>
      <div className="flex h-screen w-screen bg-background text-foreground">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onCollapse={() => setIsSidebarCollapsed(true)}
          selectedCanvasId={selectedCanvas?.id || null}
          onSelectCanvas={(canvas) => setSelectedCanvas(canvas)}
          onUpgradeClick={() => openSettings('billing')}
        />
        <ResizablePanelGroup direction="horizontal" className="flex-grow">
          <ResizablePanel defaultSize={isPdfSidebarOpen ? 70 : 100}>
            <main className="flex-grow flex flex-col relative h-full">
              {isSidebarCollapsed && (
                <div className="flex items-center p-2 border-b border-gray-700 text-white flex-shrink-0 h-[57px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="mr-2 hover:bg-gray-700"
                  >
                    <PanelLeftOpen size={20} />
                  </Button>
                  {selectedCanvas && (
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      <span className="font-medium">{selectedCanvas.title}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex-grow">
                {selectedCanvas ? (
                  <FlowDiagram
                    canvasId={selectedCanvas.id}
                    key={selectedCanvas.id}
                    newNodeRequest={newNodeRequest}
                    onNodeAdded={() => setNewNodeRequest(null)}
                    onSettingsClick={() => openSettings('account')}
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
    </>
  );
};

export default Index;