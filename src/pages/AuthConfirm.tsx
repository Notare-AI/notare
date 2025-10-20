import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (!token_hash || !type) {
      setErrorMessage('Invalid verification link. The link is missing required parameters.');
      setStatus('error');
      return;
    }

    const verifyUser = async () => {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });

      if (error) {
        switch (error.message) {
          case 'Token has expired':
            setErrorMessage('This verification link has expired. Please request a new one.');
            break;
          case 'Token not found':
            setErrorMessage('This verification link is invalid or has already been used.');
            break;
          default:
            setErrorMessage('An unexpected error occurred. Please try again.');
            break;
        }
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    };

    verifyUser();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-card border border-border rounded-lg shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Verifying your account...</h1>
            <p className="text-muted-foreground">Please wait a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">Account Confirmed!</h1>
            <p className="text-muted-foreground">
              Welcome! You will be redirected to your dashboard shortly.
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
            <p className="text-destructive">{errorMessage}</p>
            <Button asChild className="mt-4">
              <Link to="/login">Return to Login</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthConfirmPage;