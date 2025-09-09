'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Plus, Trash2 } from 'lucide-react';
import UserProfile from './user-profile';
import type { User } from 'firebase/auth';
import { useChat } from '@/contexts/chat-provider';
import { ScrollArea } from './ui/scroll-area';

interface ChatSidebarProps {
  user: User;
}

export default function ChatSidebar({ user }: ChatSidebarProps) {
  const { sessions, activeSessionId, selectSession, createNewSession, deleteSession } = useChat();

  const sortedSessions = Object.values(sessions).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
      <SidebarHeader className="h-16 items-center justify-start p-4">
        <div className="flex items-center gap-2">
            <Bot className="h-7 w-7 text-sidebar-primary" />
            <span className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                Scopie Chat
            </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 pt-0">
        <Button className="w-full justify-start" onClick={createNewSession}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
        </Button>
        <ScrollArea className="flex-grow my-4 -mx-2">
          <SidebarMenu className="px-2">
            {sortedSessions.map((session) => (
              <SidebarMenuItem key={session.id} className="group/item">
                <SidebarMenuButton
                  isActive={session.id === activeSessionId}
                  onClick={() => selectSession(session.id)}
                  className="truncate"
                  tooltip={{ children: session.title, side: 'right' }}
                >
                  <MessageSquare />
                  <span>{session.title}</span>
                </SidebarMenuButton>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/item:opacity-100 group-data-[collapsible=icon]:hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <UserProfile user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
