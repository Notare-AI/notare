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
import WhatsNewModal from "@/components/WhatsNewModal";
import { LATEST_UPDATE_VERSION } from "@/lib/updates";

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
  const [sidebarRefetchTrigger, setSidebarRefetchTrigger] = useState(0); // New state trigger

  useEffect(() => {
    const seenVersion = localStorage.getItem('notare-update-version');
    if (seenVersion !== LATEST_UPDATE_VERSION) {
      setIsWhatsNewOpen(true);
    }
  }, []);

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

  useEffect(() => {
    const copyCanvasOnSignup = async (canvasId: string) => {
      if (!user) return;

      console.log('🎨 Starting canvas copy process for ID:', canvasId); // Debug log
      const toastId = showLoading('Copying canvas to your account...');
      try {
        // 1. Fetch the public canvas data
        console.log('🔍 Fetching public canvas data...'); // Debug log
        const { data: publicCanvas, error: fetchError } = await supabase
          .from('canvases')
          .select('title, canvas_data')
          .eq('id', canvasId)
          .eq('is_public', true)
          .single();

        console.log('📋 Public canvas data:', publicCanvas); // Debug log
        console.log('❗ Fetch error:', fetchError); // Debug log

        if (fetchError) {
          console.error('💥 Fetch error details:', fetchError);
          throw new Error(`Could not find the shared canvas: ${fetchError.message}`);
        }

        if (!publicCanvas) {
          console.error('💥 No canvas data returned');
          throw new Error('Canvas not found or not public');
        }

        if (!publicCanvas.canvas_data) {
          console.error('💥 Canvas has no data');
          throw new Error('Canvas has no data to copy');
        }

        // 2. Create a new canvas for the current user
        const newTitle = `Copy of ${publicCanvas.title}`;
        console.log('💾 Creating new canvas with title:', newTitle); // Debug log
        
        const { data: newCanvas, error: insertError } = await supabase
          .from('canvases')
          .insert({
            title: newTitle,
            canvas_data: publicCanvas.canvas_data,
            user_id: user.id, // Changed from owner_id to user_id
          })
          .select('id, title, is_public')
          .single();

        console.log('✅ New canvas created:', newCanvas); // Debug log
        console.log('❗ Insert error:', insertError); // Debug log

        if (insertError) {
          console.error('💥 Insert error details:', insertError);
          throw new Error(`Failed to copy canvas: ${insertError.message}`);
        }

        if (!newCanvas) {
          console.error('💥 No canvas returned from insert');
          throw new Error('No canvas data returned after creation');
        }

        dismissToast(toastId);
        showSuccess('Canvas copied to your account!');
        
        if (newCanvas) {
          setSelectedCanvas(newCanvas);
          setSidebarRefetchTrigger(prev => prev + 1); // Trigger sidebar refresh
        }
      } catch (error: any) {
        console.error('💥 Error in canvas copy:', error); // Debug log
        dismissToast(toastId);
        showError(error.message);
      } finally {
        // 3. Clean up the URL parameter
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('copyCanvas');
        setSearchParams(newParams, { replace: true });
      }
    };

    const canvasIdToCopy = searchParams.get('copyCanvas');
    console.log('🔗 Dashboard useEffect - copyCanvas param:', canvasIdToCopy); // Debug log
    console.log('👤 Dashboard useEffect - user:', user?.id); // Debug log
    
    if (canvasIdToCopy && user) {
      console.log('🚀 Initiating canvas copy for existing user...'); // Debug log
      copyCanvasOnSignup(canvasIdToCopy);
    }
  }, [user, searchParams, setSearchParams]);

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
          onCollapse={() => setIsSidebarCollapsed(false)}
          selectedCanvasId={selectedCanvas?.id || null}
          onSelectCanvas={(canvas) => setSelectedCanvas(canvas as Canvas)}
          onUpgradeClick={() => openSettings('billing')}
          onSettingsClick={openSettings}
          refetchTrigger={sidebarRefetchTrigger} // Pass the trigger
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