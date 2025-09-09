'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
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
        <Button variant="ghost" className="w-full justify-start p-2 h-auto">
          <div className="flex w-full items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
              <span className="font-medium truncate text-sm text-sidebar-foreground">{user.displayName}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
