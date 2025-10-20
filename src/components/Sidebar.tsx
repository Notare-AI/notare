import { useState, useEffect, useRef } from "react";
import {
  PenSquare,
  Plus,
  LogOut,
  MoreVertical,
  PanelLeftClose,
  Sparkles,
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

interface Canvas {
  id: string;
  title: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  selectedCanvasId: string | null;
  onSelectCanvas: (canvas: Canvas | null) => void;
  onCollapse: () => void;
  onUpgradeClick: () => void;
}

const Sidebar = ({
  isCollapsed,
  selectedCanvasId,
  onSelectCanvas,
  onCollapse,
  onUpgradeClick,
}: SidebarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [canvasToDelete, setCanvasToDelete] = useState<Canvas | null>(null);
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useUserProfile();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();
  }, []);

  const fetchCanvases = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("canvases")
      .select("id, title")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      showError("Could not fetch your canvases.");
      console.error(error);
    } else {
      setCanvases(data);
      if (!selectedCanvasId && data && data.length > 0) {
        onSelectCanvas(data[0]);
      } else if (
        selectedCanvasId &&
        !data.some((c) => c.id === selectedCanvasId)
      ) {
        onSelectCanvas(data.length > 0 ? data[0] : null);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchCanvases();
    }
  }, [user]);

  useEffect(() => {
    if (editingCanvasId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCanvasId]);

  const handleAddCanvas = async (title: string) => {
    if (!user) {
      showError("You must be logged in to add a canvas.");
      return;
    }
    const { data, error } = await supabase
      .from("canvases")
      .insert([{ title, owner_id: user.id }])
      .select("id, title")
      .single();

    if (error) {
      showError("Failed to add canvas.");
      console.error(error);
    } else {
      showSuccess("Canvas added successfully!");
      fetchCanvases();
      if (data) {
        onSelectCanvas(data);
      }
      setIsModalOpen(false);
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

  return (
    <>
      <div
        className={`flex h-screen flex-col bg-card text-foreground transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden whitespace-nowrap">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <PenSquare size={20} />
              <span className="font-semibold">Notare</span>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(true)}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
              >
                <Plus size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCollapse}
                className="text-muted-foreground hover:text-foreground h-8 w-8 ml-1"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow p-4 overflow-y-auto">
            <ul className="space-y-1">
              {canvases.map((canvas) => (
                <li key={canvas.id}>
                  {editingCanvasId === canvas.id ? (
                    <Input
                      ref={inputRef}
                      value={newTitle}
                      onChange={handleTitleChange}
                      onBlur={handleTitleSave}
                      onKeyDown={handleKeyDown}
                      className="h-9 bg-muted border-border text-foreground w-full"
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
                      className={`group flex items-center justify-between rounded-md px-3 h-9 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                        selectedCanvasId === canvas.id
                          ? "bg-accent"
                          : "hover:bg-accent"
                      }`}
                    >
                      <span className="truncate flex-grow pr-2">
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
                            className="h-8 w-8 shrink-0 -mr-2 text-muted-foreground group-hover:text-foreground"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-popover text-popover-foreground border-border"
                        >
                          <DropdownMenuItem
                            onClick={() => handleRename(canvas)}
                            className="hover:!bg-accent focus:!bg-accent"
                          >
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setCanvasToDelete(canvas)}
                            className="hover:!bg-accent focus:!bg-accent text-destructive focus:!text-destructive-foreground"
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="mb-4">
              <CreditUsageIndicator />
            </div>
            {profile?.subscription_plan === 'free' && (
              <Button
                onClick={onUpgradeClick}
                className="w-full mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-opacity"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {user?.email}
                  </p>
                  <p className="text-xs text-green-600 dark:text-orange-400">Connected</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AddCanvasModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddCanvas={handleAddCanvas}
      />
      <AlertDialog
        open={!!canvasToDelete}
        onOpenChange={(open) => !open && setCanvasToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the canvas "{canvasToDelete?.title}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
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
    </>
  );
};

export default Sidebar;