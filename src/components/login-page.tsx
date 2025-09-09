'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bot } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8 0 123.3 111.8 12.5 244 12.5c72.5 0 134.4 29.3 181.4 76.6l-64 64c-34.6-32.4-79.2-52.4-117.4-52.4-93.1 0-169.5 76.4-169.5 169.5s76.4 169.5 169.5 169.5c103.2 0 136.5-79.3 140.8-114.8H244v-80h243.2c1.3 12.8 2.8 25.1 2.8 38.2z"></path>
    </svg>
  );

export default function LoginPage() {
  const { toast } = useToast();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google: ', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Could not sign in with Google. Please try again.',
      });
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 rounded-lg border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3">
                <Bot className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Scopie Chat</h1>
            </div>
            <p className="text-muted-foreground">Sign in to continue to your AI chat assistant.</p>
            <Button size="lg" onClick={handleSignIn} className="w-full">
                <GoogleIcon />
                Sign in with Google
            </Button>
        </div>
    </div>
  );
}
