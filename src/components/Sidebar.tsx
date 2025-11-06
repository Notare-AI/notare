import { useState, useEffect, useRef, useCallback } from "react";
import {
  PenSquare,
  Plus,
  LogOut,
  MoreVertical,
  PanelLeftClose,
  Sparkles,
  Settings,
  User as UserIcon,
  Search,
  CreditCard,
  Palette,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AddCanvasModal from "./AddCanvasModal";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "./ui/input";
import CreditUsageIndicator from "./CreditUsageIndicator";
import { useUserProfile } from "@/contexts/UserProfileContext";
import ShareCanvasModal from "./ShareCanvasModal";
import { checkIfUserNeedsTutorial, createTutorialCanvas } from "@/lib/tutorial";

interface Canvas {
  id: string;
  title: string;
  is_public: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  selectedCanvasId: string | null;
  onSelectCanvas: (canvas: Canvas | null) => void;
  onCollapse: () => void;
  onUpgradeClick: () => void;
  onSettingsClick: (tab?: 'account' | 'billing' | 'theme') => void;
  refetchTrigger: number; // New prop to trigger refetch from parent
  onImportCanvasFromUrl: (url: string) => Promise<boolean>; // New prop
}

const MAX_FREE_CANVASES = 5;

const Sidebar = ({
  isCollapsed,
  selectedCanvasId,
  onSelectCanvas,
  onCollapse,
  onUpgradeClick,
  onSettingsClick,
  refetchTrigger,
  onImportCanvasFromUrl,
}: SidebarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [canvasToDelete, setCanvasToDelete] = useState<Canvas | null>(null);
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useUserProfile();
  const [shareModalCanvas, setShareModalCanvas] = useState<Canvas | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();
  }, []);

  const fetchCanvases = useCallback(async () => {
    if (!user) {
      setCanvases([]);
      return;
    }
    
    const { data, error } = await supabase
      .from("canvases")
      .select("id, title, is_public")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      showError("Could not fetch your canvases.");
      console.error(error);
      return;
    }

    // Check if this is a first-time user (no canvases)
    if (data.length === 0) {
      try {
        const { data: tutorialCanvas, error: tutorialError } = await createTutorialCanvas(user.id);
        if (tutorialError) {
          console.error('Failed to create tutorial canvas:', tutorialError);
        } else if (tutorialCanvas) {
          // Re-fetch canvases to include the new tutorial
          const { data: updatedCanvases } = await supabase
            .from("canvases")
            .select("id, title, is_public")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });
          
          if (updatedCanvases) {
            setCanvases(updatedCanvases);
            onSelectCanvas(updatedCanvases[0]); // Auto-select the tutorial canvas
            showSuccess("🎉 Welcome to Notare! We've created a tutorial canvas to get you started.");
            return;
          }
        }
      } catch (error) {
        console.error('Error creating tutorial canvas:', error);
      }
    }

    setCanvases(data);
    if (!selectedCanvasId && data && data.length > 0) {
      onSelectCanvas(data[0]);
    } else if (
      selectedCanvasId &&
      !data.some((c) => c.id === selectedCanvasId)
    ) {
      onSelectCanvas(data.length > 0 ? data[0] : null);
    }
  }, [user, selectedCanvasId, onSelectCanvas]);

  useEffect(() => {
    if (user) {
      fetchCanvases();
    }
  }, [user, fetchCanvases, refetchTrigger]);

  useEffect(() => {
    if (editingCanvasId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCanvasId]);

  const handleAddCanvas = async (title: string) => {
    if (!user) {
      showError("You must be logged in to add a canvas.");
      return false;
    }

    // Check for free tier limit
    if (profile?.subscription_plan === 'free' && canvases.length >= MAX_FREE_CANVASES) {
      showError(`Free users are limited to ${MAX_FREE_CANVASES} canvases. Please upgrade to Research Pro for unlimited canvases.`);
      return false;
    }

    const { data, error } = await supabase
      .from("canvases")
      .insert([{ title, owner_id: user.id }])
      .select("id, title, is_public")
      .single();

    if (error) {
      showError("Failed to add canvas.");
      console.error(error);
      return false;
    } else {
      showSuccess("Canvas added successfully!");
      fetchCanvases();
      if (data) {
        onSelectCanvas(data);
      }
      return true;
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Failed to sign out.");
    }
  };

  const handleRename = (canvas: Canvas) => {
    setEditingCanvasId(canvas.id);
    setNewTitle(canvas.title);
  };

  const handleShare = (canvas: Canvas) => {
    setShareModalCanvas(canvas);
    setIsShareModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (!editingCanvasId || !newTitle.trim()) {
      setEditingCanvasId(null);
      return;
    }

    const originalCanvas = canvases.find((c) => c.id === editingCanvasId);
    if (originalCanvas && originalCanvas.title === newTitle.trim()) {
      setEditingCanvasId(null);
      return;
    }

    const { error } = await supabase
      .from("canvases")
      .update({ title: newTitle.trim() })
      .eq("id", editingCanvasId);

    if (error) {
      showError("Failed to rename canvas.");
    } else {
      showSuccess("Canvas renamed.");
      fetchCanvases();
    }
    setEditingCanvasId(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleTitleSave();
    } else if (event.key === "Escape") {
      setEditingCanvasId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!canvasToDelete) return;

    const { error } = await supabase
      .from("canvases")
      .delete()
      .eq("id", canvasToDelete.id);

    if (error) {
      showError("Failed to remove canvas.");
    } else {
      showSuccess("Canvas removed.");
      fetchCanvases();
    }
    setCanvasToDelete(null);
  };

  const filteredCanvases = canvases.filter(canvas =>
    canvas.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserDisplayName = () => {
    if (!user?.email) return "User";
    const emailParts = user.email.split("@");
    return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
  };

  return (
    <>
      <div
        className={`flex h-screen flex-col bg-card/95 backdrop-blur-sm text-foreground transition-all duration-300 ease-in-out border-r border-border/50 ${
          isCollapsed ? "w-0" : "w-72"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden whitespace-nowrap">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <PenSquare size={20} className="text-primary" />
              </div>
              <span className="font-bold text-lg">Notare</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(true)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9 w-9 transition-colors"
                title="Create new canvas"
              >
                <Plus size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCollapse}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9 w-9 transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </Button>
            </div>
          </div>

          <div className="p-4 pb-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search canvases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <nav className="flex-grow px-4 pb-4 overflow-y-auto">
            <div className="space-y-1">
              {filteredCanvases.length === 0 && searchQuery ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No canvases found for "{searchQuery}"
                </div>
              ) : (
                filteredCanvases.map((canvas) => (
                  <div key={canvas.id}>
                    {editingCanvasId === canvas.id ? (
                      <Input
                        ref={inputRef}
                        value={newTitle}
                        onChange={handleTitleChange}
                        onBlur={handleTitleSave}
                        onKeyDown={handleKeyDown}
                        className="h-10 bg-muted/50 border-border/50 text-foreground"
                      />
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectCanvas(canvas)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectCanvas(canvas);
                          }
                        }}
                        className={`group flex items-center justify-between rounded-lg px-3 h-10 text-sm cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          selectedCanvasId === canvas.id
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                            : "hover:bg-muted/50 hover:shadow-sm"
                        }`}
                      >
                        <span className="truncate flex-grow pr-2 font-medium">
                          {canvas.title}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 text-muted-foreground hover:text-foreground hover:bg-muted/70"
                            >
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-popover/95 backdrop-blur-sm text-popover-foreground border-border/50 shadow-lg"
                          >
                            <DropdownMenuItem
                              onClick={() => handleRename(canvas)}
                              className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary cursor-pointer"
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShare(canvas)}
                              className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary cursor-pointer"
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCanvasToDelete(canvas)}
                              className="hover:bg-destructive/10 focus:bg-destructive/10 text-destructive hover:text-destructive focus:text-destructive cursor-pointer"
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </nav>

          <div className="border-t border-border/50 p-4 space-y-4 bg-muted/20">
            <CreditUsageIndicator />
            
            {profile?.subscription_plan === 'free' && (
              <Button
                onClick={onUpgradeClick}
                className="w-full h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-sm"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            )}

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-border/50">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Settings size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover/95 backdrop-blur-sm text-popover-foreground border-border/50 shadow-lg w-52"
                >
                  <DropdownMenuItem 
                    onClick={() => onSettingsClick('account')}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary cursor-pointer"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onSettingsClick('billing')}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary cursor-pointer"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing & Subscription
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onSettingsClick('theme')}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary cursor-pointer"
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Theme & Appearance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="hover:bg-destructive/10 focus:bg-destructive/10 text-destructive hover:text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      <AddCanvasModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddCanvas={handleAddCanvas}
        onImportCanvasFromUrl={onImportCanvasFromUrl}
      />
      <AlertDialog
        open={!!canvasToDelete}
        onOpenChange={(open) => !open && setCanvasToDelete(null)}
      >
        <AlertDialogContent className="bg-card/95 backdrop-blur-sm border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the canvas "{canvasToDelete?.title}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted/50 hover:bg-muted/70">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ShareCanvasModal
        isOpen={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        canvas={shareModalCanvas}
        onCanvasUpdate={fetchCanvases}
      />
    </>
  );
};

export default Sidebar;