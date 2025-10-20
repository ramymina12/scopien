'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { getUserWebhookConfig, getGlobalWebhookSettings } from '@/lib/admin';
import { Badge } from './ui/badge';
import { Webhook, Globe, Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function WebhookStatusIndicator() {
  const { user } = useAuth();
  const [webhookSource, setWebhookSource] = useState<'user' | 'global' | 'env' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWebhookSource = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check for user-specific webhook
        const userConfig = await getUserWebhookConfig(user.uid);
        
        if (userConfig && userConfig.isActive) {
          setWebhookSource('user');
        } else {
          // Check for global settings
          const globalSettings = await getGlobalWebhookSettings();
          
          if (globalSettings) {
            setWebhookSource('global');
          } else {
            setWebhookSource('env');
          }
        }
      } catch (error) {
        console.error('Error checking webhook source:', error);
        setWebhookSource('env');
      } finally {
        setLoading(false);
      }
    };

    checkWebhookSource();
  }, [user]);

  if (loading || !webhookSource) return null;

  const config = {
    user: {
      label: 'Custom Webhook',
      icon: Webhook,
      color: 'bg-purple-500',
      description: 'Using your personal webhook configuration',
    },
    global: {
      label: 'Global Webhook',
      icon: Globe,
      color: 'bg-blue-500',
      description: 'Using global webhook configuration',
    },
    env: {
      label: 'Default Webhook',
      icon: Settings,
      color: 'bg-gray-500',
      description: 'Using environment webhook configuration',
    },
  };

  const current = config[webhookSource];
  const Icon = current.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${current.color} text-white border-none cursor-help`}>
            <Icon className="mr-1 h-3 w-3" />
            {current.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{current.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

