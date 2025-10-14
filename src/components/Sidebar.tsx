import { useState, useEffect, useRef } from "react";
import {
  PenSquare,
  Plus,
  LogOut,
  MoreVertical,
  PanelLeftClose,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AddCanvasModal from "./AddCanvasModal";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
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
}

const Sidebar = ({
  isCollapsed,
  selectedCanvasId,
  onSelectCanvas,
  onCollapse,
}: SidebarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [canvasToDelete, setCanvasToDelete] = useState<Canvas | null>(null);
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const navigate = useNavigate();
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
    } else {
      navigate("/login");
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

  const handleUpgradeClick = () => {
    setIsUpgrading(true);
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`flex h-screen flex-col bg-white dark:bg-[#212121] text-gray-800 dark:text-gray-200 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden whitespace-nowrap">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2">
              <PenSquare size={20} />
              <span className="font-semibold">Notare</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus size={20} />
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCollapse}
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 h-8 w-8 ml-1"
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
                      className="h-9 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white w-full"
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
                      className={`group flex items-center justify-between rounded-md px-3 h-9 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                        selectedCanvasId === canvas.id
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
                            className="h-8 w-8 shrink-0 -mr-2 text-gray-400 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white dark:bg-[#363636] text-black dark:text-white border-gray-200 dark:border-gray-500"
                        >
                          <DropdownMenuItem
                            onClick={() => handleRename(canvas)}
                            className="hover:!bg-gray-100 dark:hover:!bg-[#424242] focus:!bg-gray-100 dark:focus:!bg-[#424242]"
                          >
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setCanvasToDelete(canvas)}
                            className="hover:!bg-gray-100 dark:hover:!bg-[#424242] focus:!bg-gray-100 dark:focus:!bg-[#424242] text-red-500 dark:text-red-400 hover:!text-red-600 focus:!text-red-600"
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
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-4">
              <CreditUsageIndicator />
            </div>
            {profile?.subscription_plan === 'free' && (
              <Button
                onClick={handleUpgradeClick}
                disabled={isUpgrading}
                className="w-full mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-opacity"
              >
                {isUpgrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Upgrade to Pro
              </Button>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white">
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
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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
        <AlertDialogContent className="bg-white dark:bg-[#363636] text-black dark:text-white border-gray-200 dark:border-gray-500">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              This will permanently delete the canvas "{canvasToDelete?.title}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
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