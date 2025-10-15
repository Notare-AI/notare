import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthError(error.message);
      showError(error.message);
    } else {
      setMessage('Check your email for the confirmation link!');
      showSuccess('Check your email for the confirmation link!');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      showError(error.message);
    }
    // The onAuthStateChange listener in Login.tsx will handle the redirect.
    setLoading(false);
  };

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-[#2A2A2A]">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <form onSubmit={handleSignIn} className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-signin" className="text-gray-400">Email</Label>
              <Input
                id="email-signin"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#212121] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signin" className="text-gray-400">Password</Label>
              <Input
                id="password-signin"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#212121] border-gray-600 text-white"
              />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </div>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-signup" className="text-gray-400">Email</Label>
              <Input
                id="email-signup"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#212121] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup" className="text-gray-400">Password</Label>
              <Input
                id="password-signup"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#212121] border-gray-600 text-white"
              />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}
            <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;