import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';

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
      <div className="flex items-center justify-center min-h-screen bg-[#212121] text-white">
        <div className="text-center">
          <div>Loading...</div>
          <div className="text-sm text-gray-400 mt-2">Checking authentication...</div>
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