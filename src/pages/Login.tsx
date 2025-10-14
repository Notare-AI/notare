import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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
          <p className="text-gray-400">Sign in to continue</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#424242',
                  brandAccent: '#616161',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#424242',
                  defaultButtonBackgroundHover: '#616161',
                  defaultButtonBorder: 'lightgray',
                  defaultButtonText: 'white',
                  dividerBackground: '#616161',
                  inputBackground: '#212121',
                  inputBorder: 'gray',
                  inputBorderHover: 'lightgray',
                  inputBorderFocus: 'white',
                  inputText: 'white',
                  inputLabelText: 'lightgray',
                  inputPlaceholder: 'darkgray',
                  messageText: 'white',
                  messageTextDanger: 'red',
                  anchorTextColor: 'lightgray',
                  anchorTextHoverColor: 'white',
                },
              },
            },
          }}
          providers={[]}
          theme="dark"
        />
      </div>
    </div>
  );
};

export default Login;