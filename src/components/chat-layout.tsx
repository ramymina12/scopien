'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Bot, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Menu, 
  X, 
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ThemeToggle } from './theme-toggle';
import { useChat } from '@/contexts/chat-provider';
import { useAdmin } from '@/hooks/use-admin';
import { ScrollArea } from './ui/scroll-area';
import { WebhookStatusIndicator } from './webhook-status-indicator';
import type { User } from 'firebase/auth';

interface ChatLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function ChatLayout({ children, user }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { sessions, activeSessionId, selectSession, createNewSession, deleteSession } = useChat();
  const { isAdmin } = useAdmin();
  const router = useRouter();

  const sortedSessions = Object.values(sessions).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">Scopie Chat</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 px-4 py-4">
              <Button className="w-full justify-start mb-4 shadow-sm" onClick={createNewSession}>
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Recent Chats
                </h3>
              </div>
              
              <ScrollArea className="flex-grow -mx-4">
                <div className="px-4 space-y-1">
                  {sortedSessions.map((session) => (
                    <div key={session.id} className="group/item relative">
                      <Button
                        variant={session.id === activeSessionId ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start',
                          session.id === activeSessionId && 'bg-primary/10 text-primary'
                        )}
                        onClick={() => selectSession(session.id)}
                      >
                        <MessageSquare className="mr-3 h-4 w-4" />
                        <span className="truncate">{session.title}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex h-full flex-col bg-card border-r">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              {!sidebarCollapsed && <span className="font-semibold">Scopie Chat</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:flex hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 px-4 py-4">
            <Button 
              className={cn(
                "w-full justify-start mb-4 shadow-sm",
                sidebarCollapsed && "justify-center px-2"
              )} 
              onClick={createNewSession}
            >
              <Plus className={cn("h-4 w-4", !sidebarCollapsed && "mr-2")} />
              {!sidebarCollapsed && "New Chat"}
            </Button>
            
            {!sidebarCollapsed && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Recent Chats
                </h3>
              </div>
            )}
            
            <ScrollArea className="flex-grow -mx-4">
              <div className="px-4 space-y-1">
                {sortedSessions.map((session) => (
                  <div key={session.id} className="group/item relative">
                    <Button
                      variant={session.id === activeSessionId ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        session.id === activeSessionId && 'bg-primary/10 text-primary',
                        sidebarCollapsed && "justify-center px-2"
                      )}
                      onClick={() => selectSession(session.id)}
                    >
                      <MessageSquare className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
                      {!sidebarCollapsed && <span className="truncate">{session.title}</span>}
                    </Button>
                    {!sidebarCollapsed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="border-t p-4">
            <div className={cn(
              "flex items-center gap-3",
              sidebarCollapsed && "justify-center"
            )}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <WebhookStatusIndicator />
              <ThemeToggle />
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2"
                >
                  <span>Admin Panel</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}