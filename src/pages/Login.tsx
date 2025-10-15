import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AuthForm from '@/components/AuthForm';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Login: Component mounted');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Login: Auth state changed:', event, session);
      if (session) {
        console.log('Login: Session found, navigating to dashboard...');
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  console.log('Login: Rendering login page');

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212121]">
      <div className="w-full max-w-md p-8 rounded-lg bg-[#363636] border border-gray-700">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Notare</h1>
          <p className="text-gray-400">Sign in or create an account to continue</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;