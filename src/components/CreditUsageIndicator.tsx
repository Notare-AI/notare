import { useUserProfile } from '@/contexts/UserProfileContext';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const CreditUsageIndicator = () => {
  const { profile, loading, forceRefreshCredits } = useUserProfile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceRefreshCredits();
    } catch (error) {
      console.error('Failed to refresh credits:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center text-xs text-gray-400 p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading credits...
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const resetDate = new Date(profile.credits_reset_at);
  const resetsIn = formatDistanceToNow(resetDate, { addSuffix: true });

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-between text-xs text-gray-400 p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 cursor-default">
          <span className="font-medium text-gray-600 dark:text-gray-300">AI Credits</span>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-white">
              <Sparkles size={14} className="text-purple-500" />
              <span>{profile.ai_credits}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto w-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" align="center" className="bg-[#363636] text-white border-gray-500">
        <p>You have {profile.ai_credits} credits remaining.</p>
        <p className="text-xs text-gray-400">Resets {resetsIn}.</p>
        <p className="text-xs text-gray-500">Click refresh icon to update</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default CreditUsageIndicator;