import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212121]">
      <div className="w-full max-w-md p-8 rounded-lg bg-[#363636] border border-gray-700">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Notare</h1>
          <p className="text-gray-400">Sign in or create an account to continue</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4f46e5',
                  brandAccent: '#4338ca',
                  defaultButtonBackground: '#424242',
                  defaultButtonBackgroundHover: '#525252',
                  inputBackground: '#212121',
                  inputBorder: '#424242',
                  inputBorderHover: '#626262',
                  inputText: 'white',
                  inputLabelText: '#a1a1aa',
                  anchorTextColor: '#a7a7a7',
                  anchorTextHoverColor: 'white',
                },
                radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                }
              },
            },
          }}
          theme="dark"
          providers={[]}
          redirectTo={`${window.location.origin}/dashboard`}
        />
      </div>
    </div>
  );
};

export default Login;