import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('AuthLayout: Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('AuthLayout: Session result:', session, error);
        
        if (error) {
          setError(error.message);
          console.error('AuthLayout: Session error:', error);
        }
        
        setSession(session);
        setLoading(false);
      } catch (err) {
        console.error('AuthLayout: Unexpected error:', err);
        setError('Unexpected error occurred');
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthLayout: Auth state changed:', session);
      setSession(session);
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    console.log('AuthLayout: Effect - loading:', loading, 'session:', session);
    if (!loading && !session) {
      console.log('AuthLayout: Redirecting to login...');
      navigate('/login');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#212121] text-white">
        <div className="text-center">
          <div>Loading...</div>
          <div className="text-sm text-gray-400 mt-2">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#212121] text-white">
        <div className="text-center">
          <div className="text-red-400">Authentication Error</div>
          <div className="text-sm text-gray-400 mt-2">{error}</div>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212121] text-white">
      <div className="text-center">
        <div>No session found</div>
        <button 
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default AuthLayout;