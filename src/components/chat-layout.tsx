'use client';

import type { User } from 'firebase/auth';
import ChatSidebar from './chat-sidebar';
import ChatArea from './chat-area';
import { SidebarProvider } from '@/components/ui/sidebar';

interface ChatLayoutProps {
  user: User;
}

export default function ChatLayout({ user }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <ChatSidebar user={user} />
        <ChatArea />
      </div>
    </SidebarProvider>
  );
}
