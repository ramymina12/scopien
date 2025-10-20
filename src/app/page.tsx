'use client';

import { useAuth } from '@/contexts/auth-provider';
import LoginPage from '@/components/login-page';
import ChatLayout from '@/components/chat-layout';
import ChatArea from '@/components/chat-area';
import { Spinner } from '@/components/spinner';
import type { User } from 'firebase/auth';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return user ? (
    <ChatLayout user={user as User}>
      <ChatArea />
    </ChatLayout>
  ) : (
    <LoginPage />
  );
}
