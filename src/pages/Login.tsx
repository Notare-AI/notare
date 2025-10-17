import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { PenSquare } from 'lucide-react';

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="text-center">
          <PenSquare className="mx-auto h-8 w-8 text-gray-800 dark:text-gray-200" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Welcome to Notare</h1>
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
                },
                radii: {
                  borderRadiusButton: '8px',
                  buttonBorderRadius: '8px',
                  inputBorderRadius: '8px',
                }
              },
              dark: {
                colors: {
                  brand: '#4f46e5',
                  brandAccent: '#6d28d9',
                  defaultButtonBackground: '#27272a',
                  defaultButtonBackgroundHover: '#3f3f46',
                  inputBackground: '#18181b',
                  inputBorder: '#3f3f46',
                  inputText: 'white',
                  inputLabelText: '#a1a1aa',
                  anchorTextColor: '#a1a1aa',
                  anchorTextHoverColor: 'white',
                }
              }
            },
          }}
          theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
          providers={['google', 'azure']}
          redirectTo={`${window.location.origin}/dashboard`}
          socialLayout="horizontal"
          localization={{
            variables: {
              sign_in: {
                button_label: 'Sign Up',
              },
              sign_up: {
                link_text: 'Already have an account? Log in',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;