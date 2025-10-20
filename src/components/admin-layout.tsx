'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminRouteGuard } from './admin-route-guard';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  Users, 
  Webhook, 
  Settings, 
  Home, 
  Menu, 
  X, 
  Shield,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ThemeToggle } from './theme-toggle';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { userData } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AdminRouteGuard>
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
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Admin Panel</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 px-4 py-4">
                <NavigationItems pathname={pathname} sidebarCollapsed={false} />
              </nav>
              <div className="border-t p-4">
                <UserProfile userData={userData} onSignOut={handleSignOut} sidebarCollapsed={false} />
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
                <Shield className="h-6 w-6 text-primary" />
                {!sidebarCollapsed && <span className="font-semibold">Admin Panel</span>}
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
            <nav className="flex-1 px-4 py-4">
              <NavigationItems pathname={pathname} sidebarCollapsed={sidebarCollapsed} />
            </nav>
            <div className="border-t p-4">
              <UserProfile userData={userData} onSignOut={handleSignOut} sidebarCollapsed={sidebarCollapsed} />
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
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Chat
                </Button>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}

function NavigationItems({ pathname, sidebarCollapsed }: { pathname: string; sidebarCollapsed: boolean }) {
  const router = useRouter();

  return (
    <ul className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.name}>
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isActive && 'bg-primary/10 text-primary',
                sidebarCollapsed && "justify-center px-2"
              )}
              onClick={() => router.push(item.href)}
            >
              <item.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
              {!sidebarCollapsed && item.name}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function UserProfile({ 
  userData, 
  onSignOut,
  sidebarCollapsed
}: { 
  userData: any; 
  onSignOut: () => void;
  sidebarCollapsed: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3",
      sidebarCollapsed && "justify-center"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={userData?.photoURL} />
        <AvatarFallback>
          {userData?.displayName?.charAt(0) || userData?.email?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {!sidebarCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {userData?.displayName || 'Admin User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userData?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
