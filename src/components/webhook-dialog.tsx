'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AppUser, WebhookConfig } from '@/types';
import { Loader, TestTube } from 'lucide-react';
import { testWebhookUrl } from '@/lib/admin';
import { useToast } from '@/hooks/use-toast';

interface WebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: AppUser[];
  webhook?: WebhookConfig | null;
  onSave: (userId: string, chatUrl: string, historyUrl: string, isActive: boolean) => Promise<void>;
}

export function WebhookDialog({ open, onOpenChange, users, webhook, onSave }: WebhookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [testingChat, setTestingChat] = useState(false);
  const [testingHistory, setTestingHistory] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    userId: webhook?.userId || '',
    chatWebhookUrl: webhook?.chatWebhookUrl || '',
    historyWebhookUrl: webhook?.historyWebhookUrl || '',
    isActive: webhook?.isActive ?? true,
  });

  useEffect(() => {
    if (webhook) {
      setFormData({
        userId: webhook.userId,
        chatWebhookUrl: webhook.chatWebhookUrl,
        historyWebhookUrl: webhook.historyWebhookUrl,
        isActive: webhook.isActive,
      });
    } else {
      setFormData({
        userId: '',
        chatWebhookUrl: '',
        historyWebhookUrl: '',
        isActive: true,
      });
    }
  }, [webhook, open]);

  const handleTestWebhook = async (url: string, type: 'chat' | 'history') => {
    if (!url) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a webhook URL first',
      });
      return;
    }

    const setTesting = type === 'chat' ? setTestingChat : setTestingHistory;
    setTesting(true);

    try {
      const result = await testWebhookUrl(url);
      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Success' : 'Test Failed',
        description: result.message,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to test webhook',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a user',
      });
      return;
    }

    // Trim URLs to remove extra spaces
    const chatUrl = formData.chatWebhookUrl.trim();
    const historyUrl = formData.historyWebhookUrl.trim();

    // Validate URLs
    if (!chatUrl.startsWith('http')) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Chat webhook URL must start with http:// or https://',
      });
      return;
    }

    if (!historyUrl.startsWith('http')) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'History webhook URL must start with http:// or https://',
      });
      return;
    }

    console.log('Saving webhook config:', { userId: formData.userId, chatUrl, historyUrl, isActive: formData.isActive });

    setLoading(true);

    try {
      await onSave(
        formData.userId,
        chatUrl,
        historyUrl,
        formData.isActive
      );
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{webhook ? 'Edit Webhook Configuration' : 'Add User Webhook'}</DialogTitle>
          <DialogDescription>
            Configure custom webhook URLs for a specific user. These will completely override the global and environment webhooks for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 text-sm">
          <p className="font-medium mb-1">⚠️ Important:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
            <li>Chat webhook URL must end with <code>/chat</code></li>
            <li>History webhook URL should NOT end with <code>/chat</code></li>
            <li>Use "Use Default" buttons to copy working URLs</li>
            <li>Always test webhooks before saving</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">User *</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => setFormData({ ...formData, userId: value })}
                disabled={!!webhook}
              >
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.uid} value={user.uid}>
                      {user.displayName || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="chat-webhook">Chat Webhook URL *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    const defaultUrl = process.env.NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL || 'https://ai.scopien.com/webhook/7742abaa-046a-4362-ab28-b89393574ae6/chat';
                    setFormData({ ...formData, chatWebhookUrl: defaultUrl });
                    toast({ title: 'Copied default URL' });
                  }}
                >
                  Use Default
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="chat-webhook"
                  type="url"
                  placeholder="https://ai.scopien.com/webhook/.../chat"
                  value={formData.chatWebhookUrl}
                  onChange={(e) => setFormData({ ...formData, chatWebhookUrl: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestWebhook(formData.chatWebhookUrl, 'chat')}
                  disabled={testingChat}
                >
                  {testingChat ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Default: {process.env.NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL || 'Not set'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="history-webhook">History Webhook URL *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    const defaultUrl = process.env.NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL || 'https://ai.scopien.com/webhook/9b5c21d6-370f-4a03-bed3-3e2b3da92c8b';
                    setFormData({ ...formData, historyWebhookUrl: defaultUrl });
                    toast({ title: 'Copied default URL' });
                  }}
                >
                  Use Default
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="history-webhook"
                  type="url"
                  placeholder="https://ai.scopien.com/webhook/..."
                  value={formData.historyWebhookUrl}
                  onChange={(e) => setFormData({ ...formData, historyWebhookUrl: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestWebhook(formData.historyWebhookUrl, 'history')}
                  disabled={testingHistory}
                >
                  {testingHistory ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Default: {process.env.NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL || 'Not set'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="is-active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this webhook configuration
                </p>
              </div>
              <Switch
                id="is-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {webhook ? 'Update Webhook' : 'Create Webhook'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

