'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Webhook, Plus, TestTube, Settings, Edit, Trash2, MoreVertical, Loader, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WebhookDialog } from '@/components/webhook-dialog';
import {
  getGlobalWebhookSettings,
  updateGlobalWebhookSettings,
  getAllWebhookConfigs,
  getAllUsers,
  upsertWebhookConfig,
  deleteWebhookConfig,
  testWebhookUrl,
} from '@/lib/admin';
import type { WebhookConfig, AppUser } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/spinner';
import { format } from 'date-fns';

export default function WebhooksPage() {
  const [loading, setLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState({
    chatWebhook: process.env.NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL || '',
    historyWebhook: process.env.NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL || '',
  });
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookConfig | null>(null);
  const [testingGlobal, setTestingGlobal] = useState<'chat' | 'history' | null>(null);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settings, webhookConfigs, userList] = await Promise.all([
        getGlobalWebhookSettings(),
        getAllWebhookConfigs(),
        getAllUsers(),
      ]);

      if (settings) {
        setGlobalSettings(settings);
      }
      setWebhooks(webhookConfigs);
      setUsers(userList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load webhook data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobal = async () => {
    setSavingGlobal(true);
    try {
      await updateGlobalWebhookSettings(
        globalSettings.chatWebhook,
        globalSettings.historyWebhook
      );
      toast({
        title: 'Success',
        description: 'Global webhook settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving global settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save global settings',
      });
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleTestGlobalWebhook = async (type: 'chat' | 'history') => {
    const url = type === 'chat' ? globalSettings.chatWebhook : globalSettings.historyWebhook;
    
    if (!url) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a webhook URL first',
      });
      return;
    }

    setTestingGlobal(type);
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
      setTestingGlobal(null);
    }
  };

  const handleSaveWebhook = async (
    userId: string,
    chatUrl: string,
    historyUrl: string,
    isActive: boolean
  ) => {
    try {
      await upsertWebhookConfig(userId, chatUrl, historyUrl, isActive);
      toast({
        title: 'Success',
        description: selectedWebhook ? 'Webhook updated successfully' : 'Webhook created successfully',
      });
      await loadData();
      setSelectedWebhook(null);
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save webhook',
      });
      throw error;
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;

    try {
      await deleteWebhookConfig(webhookToDelete.userId);
      toast({
        title: 'Success',
        description: 'Webhook deleted successfully',
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete webhook',
      });
    } finally {
      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.uid === userId);
    return user?.displayName || user?.email || 'Unknown User';
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Webhook Configuration</h1>
            <p className="text-muted-foreground">
              Configure chat and history webhook endpoints
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/webhooks/debug')}>
              Debug Info
            </Button>
            <Button onClick={() => {
              setSelectedWebhook(null);
              setDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add User Webhook
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading webhooks...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Debug Info */}
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-sm">Debug: Current Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <strong>Env Chat Webhook:</strong>
                <code className="ml-2 bg-muted px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL || 'Not set'}
                </code>
              </div>
              <div>
                <strong>Env History Webhook:</strong>
                <code className="ml-2 bg-muted px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL || 'Not set'}
                </code>
              </div>
              <div>
                <strong>Global Chat Webhook:</strong>
                <code className="ml-2 bg-muted px-2 py-1 rounded">
                  {globalSettings.chatWebhook || 'Not set'}
                </code>
              </div>
              <div>
                <strong>Global History Webhook:</strong>
                <code className="ml-2 bg-muted px-2 py-1 rounded">
                  {globalSettings.historyWebhook || 'Not set'}
                </code>
              </div>
              <div>
                <strong>Active User Webhooks:</strong> {webhooks.filter(w => w.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Global Webhook Settings</CardTitle>
              <CardDescription>
                Default webhook URLs used by all users (unless overridden)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="global-chat-webhook">Chat Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="global-chat-webhook"
                      placeholder="https://ai.scopien.com/webhook/.../chat"
                      value={globalSettings.chatWebhook}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, chatWebhook: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestGlobalWebhook('chat')}
                      disabled={testingGlobal === 'chat'}
                    >
                      {testingGlobal === 'chat' ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="global-history-webhook">History Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="global-history-webhook"
                      placeholder="https://ai.scopien.com/webhook/..."
                      value={globalSettings.historyWebhook}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, historyWebhook: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestGlobalWebhook('history')}
                      disabled={testingGlobal === 'history'}
                    >
                      {testingGlobal === 'history' ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSaveGlobal} disabled={savingGlobal}>
                  {savingGlobal && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  <Settings className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGlobalSettings({
                      chatWebhook: process.env.NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL || '',
                      historyWebhook: process.env.NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL || '',
                    });
                  }}
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User-Specific Webhooks ({webhooks.length})</CardTitle>
              <CardDescription>
                Override webhook URLs for specific users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="text-center py-12">
                  <Webhook className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No custom webhooks</h3>
                  <p className="text-muted-foreground mb-4">
                    All users are using the global webhook configuration.
                  </p>
                  <Button onClick={() => {
                    setSelectedWebhook(null);
                    setDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Webhook
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Chat Webhook</TableHead>
                        <TableHead>History Webhook</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell>
                            <p className="font-medium">{getUserName(webhook.userId)}</p>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {webhook.chatWebhookUrl.substring(0, 40)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {webhook.historyWebhookUrl.substring(0, 40)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            {webhook.isActive ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="mr-1 h-3 w-3" />
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(webhook.updatedAt), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedWebhook(webhook);
                                  setDialogOpen(true);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Webhook
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setWebhookToDelete(webhook);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Webhook
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <WebhookDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        users={users}
        webhook={selectedWebhook}
        onSave={handleSaveWebhook}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the webhook configuration for{' '}
              <strong>{webhookToDelete && getUserName(webhookToDelete.userId)}</strong>.
              The user will revert to using the global webhook settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWebhook} className="bg-destructive text-destructive-foreground">
              Delete Webhook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
