'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth-provider';
import { getUserWebhookConfig, getGlobalWebhookSettings } from '@/lib/admin';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/spinner';

export default function WebhookDebugPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [webhookInfo, setWebhookInfo] = useState<{
    source: 'user' | 'global' | 'env';
    chatUrl: string;
    historyUrl: string;
    userConfig?: any;
    globalConfig?: any;
  } | null>(null);
  const { toast } = useToast();

  const loadWebhookInfo = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userConfig = await getUserWebhookConfig(user.uid);
      const globalConfig = await getGlobalWebhookSettings();
      
      let source: 'user' | 'global' | 'env';
      let chatUrl = '';
      let historyUrl = '';

      if (userConfig && userConfig.isActive) {
        source = 'user';
        chatUrl = userConfig.chatWebhookUrl;
        historyUrl = userConfig.historyWebhookUrl;
      } else if (globalConfig) {
        source = 'global';
        chatUrl = globalConfig.chatWebhook;
        historyUrl = globalConfig.historyWebhook;
      } else {
        source = 'env';
        chatUrl = process.env.NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL || '';
        historyUrl = process.env.NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL || '';
      }

      setWebhookInfo({
        source,
        chatUrl,
        historyUrl,
        userConfig,
        globalConfig,
      });
    } catch (error) {
      console.error('Error loading webhook info:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load webhook information',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhookInfo();
  }, [user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Webhook Debug Info</h1>
            <p className="text-muted-foreground">
              Current webhook configuration for {user?.email}
            </p>
          </div>
          <Button onClick={loadWebhookInfo}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading webhook info...</p>
        </div>
      ) : webhookInfo ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Webhook Source</CardTitle>
              <CardDescription>Which webhook configuration is being used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize mb-2">
                {webhookInfo.source === 'user' && '🟣 User-Specific Webhook'}
                {webhookInfo.source === 'global' && '🔵 Global Webhook Settings'}
                {webhookInfo.source === 'env' && '⚙️ Environment Variables'}
              </div>
              <p className="text-sm text-muted-foreground">
                {webhookInfo.source === 'user' && 'This user has a custom webhook configuration'}
                {webhookInfo.source === 'global' && 'Using global webhook settings from admin panel'}
                {webhookInfo.source === 'env' && 'Using default webhooks from .env file'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Webhook URLs</CardTitle>
              <CardDescription>These are the URLs being used for chat requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Chat Webhook URL</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(webhookInfo.chatUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="block bg-muted p-3 rounded-md text-xs break-all">
                  {webhookInfo.chatUrl || 'Not configured'}
                </code>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">History Webhook URL</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(webhookInfo.historyUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="block bg-muted p-3 rounded-md text-xs break-all">
                  {webhookInfo.historyUrl || 'Not configured'}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Webhook URLs from .env file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL</Label>
                <code className="block bg-muted p-3 rounded-md text-xs break-all mt-2">
                  {process.env.NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL || 'Not set'}
                </code>
              </div>
              <div>
                <Label className="text-sm font-medium">NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL</Label>
                <code className="block bg-muted p-3 rounded-md text-xs break-all mt-2">
                  {process.env.NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL || 'Not set'}
                </code>
              </div>
            </CardContent>
          </Card>

          {webhookInfo.userConfig && (
            <Card className="border-purple-500">
              <CardHeader>
                <CardTitle>User-Specific Configuration (Active)</CardTitle>
                <CardDescription>Custom webhook override for this user</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                  {JSON.stringify(webhookInfo.userConfig, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {webhookInfo.globalConfig && (
            <Card className="border-blue-500">
              <CardHeader>
                <CardTitle>Global Configuration</CardTitle>
                <CardDescription>Admin-configured global webhooks</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                  {JSON.stringify(webhookInfo.globalConfig, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>If you're getting errors:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Check that the URLs above match the working URLs</li>
                <li>Chat URL must end with <code>/chat</code></li>
                <li>History URL should NOT end with <code>/chat</code></li>
                <li>Both URLs should start with <code>https://</code></li>
                <li>Go to Webhooks page and test each URL</li>
                <li>If custom webhook fails, disable it or delete it</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No webhook information available</p>
        </div>
      )}
    </AdminLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

