import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, X, Crown, Loader2 } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Canvas {
  id: string;
  title: string;
  owner_id: string;
}

interface Collaborator {
  role: 'editor' | 'viewer';
  profiles: {
    id: string;
    username: string;
  }
}

interface ShareCanvasModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  canvas: Canvas | null;
  currentUser: SupabaseUser | null;
}

const ShareCanvasModal = ({ isOpen, onOpenChange, canvas, currentUser }: ShareCanvasModalProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const fetchCollaborators = useCallback(async () => {
    if (!canvas) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('canvas_collaborators')
      .select('role, profiles:user_id(id, username)')
      .eq('canvas_id', canvas.id);

    if (error) {
      showError("Failed to fetch collaborators.");
    } else {
      setCollaborators(data as any);
    }
    setIsLoading(false);
  }, [canvas]);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    } else {
      setInviteEmail("");
      setInviteRole("viewer");
    }
  }, [isOpen, fetchCollaborators]);

  const handleInvite = async () => {
    if (!canvas || !inviteEmail.trim()) return;
    setIsInviting(true);
    const toastId = showLoading("Sending invitation...");

    try {
      const { data: userId, error: rpcError } = await supabase.rpc('get_user_id_by_email', { email_param: inviteEmail.trim() });
      if (rpcError || !userId) {
        throw new Error("User with that email does not exist.");
      }
      if (userId === currentUser?.id) {
        throw new Error("You cannot invite yourself.");
      }
      if (collaborators.some(c => c.profiles.id === userId)) {
        throw new Error("User is already a collaborator.");
      }

      const { error: insertError } = await supabase.from('canvas_collaborators').insert({
        canvas_id: canvas.id,
        user_id: userId,
        role: inviteRole,
      });
      if (insertError) throw insertError;

      showSuccess("Invitation sent!");
      setInviteEmail("");
      fetchCollaborators();
    } catch (error: any) {
      showError(error.message);
    } finally {
      dismissToast(toastId);
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!canvas) return;
    const { error } = await supabase.from('canvas_collaborators').delete().match({ canvas_id: canvas.id, user_id: userId });
    if (error) {
      showError("Failed to remove collaborator.");
    } else {
      showSuccess("Collaborator removed.");
      fetchCollaborators();
    }
  };

  const handleRoleChange = async (userId: string, role: 'editor' | 'viewer') => {
    if (!canvas) return;
    const { error } = await supabase.from('canvas_collaborators').update({ role }).match({ canvas_id: canvas.id, user_id: userId });
    if (error) {
      showError("Failed to update role.");
    } else {
      showSuccess("Role updated.");
      fetchCollaborators();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{canvas?.title}"</DialogTitle>
          <DialogDescription>Invite others to collaborate on this canvas.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter email to invite..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={isInviting}
            />
            <Select value={inviteRole} onValueChange={(value: 'editor' | 'viewer') => setInviteRole(value)} disabled={isInviting}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Collaborators</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {/* Owner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback><User size={18} /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentUser?.email}</p>
                      <p className="text-xs text-muted-foreground">Owner</p>
                    </div>
                  </div>
                  <Crown size={16} className="text-yellow-500" />
                </div>
                {/* Collaborators */}
                {collaborators.map(({ profiles, role }) => (
                  <div key={profiles.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{profiles.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profiles.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={role} onValueChange={(value: 'editor' | 'viewer') => handleRoleChange(profiles.id, value)}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemove(profiles.id)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCanvasModal;