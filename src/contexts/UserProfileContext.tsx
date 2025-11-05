import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCanvasImport } from '@/hooks/useCanvasImport';
import { showSuccess, showError } from '@/utils/toast';

interface Profile {
  subscription_plan: string;
  ai_credits: number;
  credits_reset_at: string;
  username: string;
}

interface UserProfileContextType {
  user: User | null;
  sessionLoading: boolean;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetchProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { importCanvasById } = useCanvasImport(user);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setSessionLoading(false);

      if (_event === 'SIGNED_IN' && currentUser) {
        const searchParams = new URLSearchParams(location.search);
        const canvasIdToCopy = searchParams.get('copyCanvas');
        
        let redirectTo = location.state?.from;
        
        if (canvasIdToCopy) {
          try {
            await importCanvasById(canvasIdToCopy);
            showSuccess('Canvas copied to your account!');
            // Ensure redirection goes to dashboard without the copyCanvas param
            redirectTo = '/dashboard';
          } catch (e: any) {
            showError(e.message || 'Failed to automatically copy canvas.');
            // Still redirect to dashboard, but keep the original path if it was set
            redirectTo = redirectTo || '/dashboard';
          }
        }

        const finalRedirect = redirectTo ? `${redirectTo.pathname || redirectTo}${redirectTo.search || ''}` : '/dashboard';
        
        // Clean up URL parameters before redirecting
        const finalUrl = new URL(finalRedirect, window.location.origin);
        finalUrl.searchParams.delete('copyCanvas');

        navigate(finalUrl.pathname + finalUrl.search, { replace: true });
      } else if (_event === 'SIGNED_OUT') {
        setProfile(null);
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setSessionLoading(false);
      }
      // The onAuthStateChange listener will handle the user state and redirection
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, importCanvasById]);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    
    setProfileLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_plan, ai_credits, credits_reset_at, username')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      setError('Failed to fetch user profile.');
      console.error('Profile fetch error:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
    setProfileLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();

      const channel = supabase
        .channel(`profile-updates-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setProfile(payload.new as Profile);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setProfile(null);
      setProfileLoading(false);
    }
  }, [user, fetchProfile]);

  return (
    <UserProfileContext.Provider value={{ user, sessionLoading, profile, loading: profileLoading, error, refetchProfile: fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};