import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSwitcher } from './ThemeSwitcher';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const SettingsModal = ({ isOpen, onOpenChange }: SettingsModalProps) => {
  const { profile, loading, refetchProfile } = useUserProfile();
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleCancelSubscription = async () => {
    setIsBillingLoading(true);
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription');
      if (error) throw error;
      
      showSuccess("Your subscription is set to cancel at the end of your billing period.");
      await refetchProfile();
      setIsCancelConfirmOpen(false);

    } catch (error: any) {
      showError(error.message || "Could not cancel your subscription.");
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleBillingAction = () => {
    if (profile?.subscription_plan === 'premium') {
      setIsCancelConfirmOpen(true);
    } else {
      navigate('/checkout');
      onOpenChange(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw error;
      
      showSuccess("Your account has been successfully deleted.");
      onOpenChange(false); 
      setIsDeleteConfirmOpen(false);
      // Auth listener will handle redirect to /login

    } catch (error: any) {
      showError(error.message || "Could not delete your account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#363636] text-white border-gray-500 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your account and application settings.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="account" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3 bg-[#2A2A2A]">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>
            <TabsContent value="theme" className="py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Appearance</h3>
                <p className="text-sm text-gray-400">
                  Customize the look and feel of the application.
                </p>
              </div>
              <div className="mt-4">
                <ThemeSwitcher />
              </div>
            </TabsContent>
            <TabsContent value="account" className="py-4">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : profile ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Username</h3>
                      <p className="text-sm text-gray-400">{profile.username}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Subscription Plan</h3>
                      <p className="text-sm text-gray-400 capitalize">{profile.subscription_plan}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                    <h4 className="font-semibold text-red-400">Delete Account</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="mt-4"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                      Delete My Account
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <p>Could not load account details.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="billing" className="py-4">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : profile ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-[#2A2A2A] border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Current Plan: <span className="capitalize text-purple-400">{profile.subscription_plan}</span></h4>
                        <p className="text-sm text-gray-400">
                          {profile.subscription_plan === 'free' ? 'Upgrade to unlock more features.' : 'You have access to all features.'}
                        </p>
                      </div>
                      <Button onClick={handleBillingAction} disabled={isBillingLoading}>
                        {isBillingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {profile.subscription_plan === 'free' ? 'Upgrade to Pro' : 'Cancel Subscription'}
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#2A2A2A] border border-gray-700">
                    <h4 className="font-semibold mb-2">AI Credit Usage</h4>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold">{profile.ai_credits}</p>
                      <p className="text-gray-400">credits remaining</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Resets on {format(new Date(profile.credits_reset_at), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <p>Could not load billing details.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <AlertDialogContent className="bg-[#363636] text-white border-gray-500">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Your subscription will be canceled at the end of your current billing period. You will retain Pro access until that time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent hover:bg-gray-700">Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isBillingLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBillingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#363636] text-white border-gray-500">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your account, canvases, and all other associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsModal;