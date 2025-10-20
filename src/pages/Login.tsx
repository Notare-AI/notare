import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { PenSquare, MailCheck } from 'lucide-react';

const Login = () => {
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const handleSignUp = async () => {
    setShowConfirmationMessage(true);
  };

  if (showConfirmationMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-sm p-8 space-y-6 text-center bg-card border border-border rounded-lg shadow-sm">
          <MailCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to your email address. Please click the link to confirm your account.
          </p>
          <p className="text-sm text-muted-foreground/80">
            You may need to check your spam folder.
          </p>
        </div>
      </div>
    );
  }

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
          onSignUp={handleSignUp}
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