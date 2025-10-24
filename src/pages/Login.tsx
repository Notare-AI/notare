import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { PenSquare } from 'lucide-react';

const Login = () => {
  // Removed custom state and logic for 'showConfirmationMessage'
  // Relying on Supabase Auth UI to handle email confirmation messages and social redirects.

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm p-8 space-y-6 bg-card border border-border rounded-lg shadow-sm">
        <div className="text-center">
          <PenSquare className="mx-auto h-8 w-8 text-foreground" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Welcome to Notare</h1>
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
          // Removed onSignUp handler to prevent interrupting the flow
          redirectTo={`${window.location.origin}/dashboard`}
          socialLayout="horizontal"
          localization={{
            variables: {
              sign_in: {
                button_label: 'Sign In', // Changed back to standard 'Sign In'
              },
              sign_up: {
                link_text: 'Don\'t have an account? Sign Up', // Changed back to standard link text
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;