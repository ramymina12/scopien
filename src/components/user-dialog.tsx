'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { AppUser, UserRole } from '@/types';
import { Loader } from 'lucide-react';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AppUser | null;
  onSave: (userData: Partial<AppUser>) => Promise<void>;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    displayName: user?.displayName || '',
    role: user?.role || 'user' as UserRole,
    permissions: {
      chatWebhook: user?.permissions.chatWebhook ?? true,
      historyWebhook: user?.permissions.historyWebhook ?? true,
      canManageUsers: user?.permissions.canManageUsers ?? false,
      canManageWebhooks: user?.permissions.canManageWebhooks ?? false,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        email: '',
        displayName: '',
        role: 'user',
        permissions: {
          chatWebhook: true,
          historyWebhook: true,
          canManageUsers: false,
          canManageWebhooks: false,
        },
      });
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user details and permissions' : 'Create a new user account with role and permissions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!user}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base">Permissions</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="chat-webhook" className="font-normal">
                    Chat Webhook Access
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow access to chat webhook
                  </p>
                </div>
                <Switch
                  id="chat-webhook"
                  checked={formData.permissions.chatWebhook}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, chatWebhook: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="history-webhook" className="font-normal">
                    History Webhook Access
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow access to history webhook
                  </p>
                </div>
                <Switch
                  id="history-webhook"
                  checked={formData.permissions.historyWebhook}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, historyWebhook: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="manage-users" className="font-normal">
                    Can Manage Users
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow user management access
                  </p>
                </div>
                <Switch
                  id="manage-users"
                  checked={formData.permissions.canManageUsers}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canManageUsers: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="manage-webhooks" className="font-normal">
                    Can Manage Webhooks
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow webhook configuration
                  </p>
                </div>
                <Switch
                  id="manage-webhooks"
                  checked={formData.permissions.canManageWebhooks}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canManageWebhooks: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {user ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

