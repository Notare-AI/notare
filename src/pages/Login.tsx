import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { PenSquare, Copy, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [searchParams] = useSearchParams();
  const canvasIdToCopy = searchParams.get('copyCanvas');

  // Construct the redirect URL - send canvas signups back to the public canvas
  let redirectTo = `${window.location.origin}/dashboard`;
  if (canvasIdToCopy) {
    redirectTo = `${window.location.origin}/canvas/view/${canvasIdToCopy}?justSignedUp=true`;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Special message for canvas copying */}
        {canvasIdToCopy && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-lg text-primary">
                <Copy className="w-5 h-5" />
                Copy Canvas to Your Account
              </CardTitle>
              <CardDescription>
                Sign up to get your own copy of this canvas and start editing it right away!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Canvas will be automatically copied after signup</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main login card */}
        <div className="p-8 space-y-6 bg-card border border-border rounded-lg shadow-sm">
          <div className="text-center">
            <PenSquare className="mx-auto h-8 w-8 text-foreground" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              {canvasIdToCopy ? 'Join Notare' : 'Welcome to Notare'}
            </h1>
            {canvasIdToCopy && (
              <p className="mt-2 text-sm text-muted-foreground">
                Create your account to copy and edit this canvas
              </p>
            )}
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
            redirectTo={redirectTo}
            socialLayout="horizontal"
            localization={{
              variables: {
                sign_in: {
                  button_label: 'Sign In',
                },
                sign_up: {
                  link_text: 'Don\'t have an account? Sign Up',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;