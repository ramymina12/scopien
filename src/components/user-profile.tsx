'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface UserProfileProps {
  user: User;
  isAdmin?: boolean;
}

export default function UserProfile({ user, isAdmin }: UserProfileProps) {
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  const getInitials = (name: string | null) => {
    if (!name) return <UserIcon className="h-4 w-4" />;
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-sidebar-accent rounded-lg">
          <div className="flex w-full items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-sidebar-border">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
              <span className="font-medium truncate text-sm text-sidebar-foreground">{user.displayName || 'User'}</span>
              <span className="text-xs text-sidebar-foreground/60 truncate">{user.email}</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56 shadow-lg">
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
