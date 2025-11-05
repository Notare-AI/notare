import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Loader2 } from 'lucide-react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sessionLoading } = useUserProfile();

  useEffect(() => {
    if (!sessionLoading && !user) {
      // Remember the location the user was trying to access, and redirect to login.
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, sessionLoading, navigate, location]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
};

export default AuthLayout;