'use client';

import type { Message } from '@/types';
import type { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User as UserIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ActionableResponse } from './actionable-response';
import MarkdownRenderer from './markdown-renderer';

interface MessageBubbleProps {
  message: Message;
  user: User | null;
}

export default function MessageBubble({ message, user }: MessageBubbleProps) {
  const isUser = message.type === 'human';
  const isError = message.type === 'error';
  
  const getInitials = (name: string | null) => {
    if (!name) return <UserIcon className="h-4 w-4" />;
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  const avatar = isUser ? (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user?.photoURL || undefined} />
      <AvatarFallback>{getInitials(user?.displayName || null)}</AvatarFallback>
    </Avatar>
  ) : (
    <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
      <Bot className="h-5 w-5" />
    </Avatar>
  );

  const isHtml = (str: string) => /<html/i.test(str.trim());

  const renderContent = () => {
    if (message.type === 'ai') {
      if (isHtml(message.content)) {
        return <ActionableResponse htmlContent={message.content} />;
      }
      return <MarkdownRenderer content={message.content} />;
    }
    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
  }

  return (
    <div className={cn('flex items-start gap-4', isUser && 'flex-row-reverse')}>
      {!isError && avatar}
      <div className={cn(
        'flex flex-col gap-1 w-full', 
        isUser ? 'items-end' : 'items-start'
        )}>
        <div
          className={cn(
            'max-w-4xl rounded-lg p-4 w-full border shadow-sm',
            isUser ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border',
            isError && 'bg-destructive/10 border-destructive text-destructive-foreground w-full'
          )}
        >
          {isError && (
             <div className="flex items-center gap-2 font-semibold mb-2">
                <AlertTriangle className="h-5 w-5" /> Error
             </div>
          )}
          {renderContent()}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {format(new Date(message.timestamp), 'h:mm a')}
        </span>
      </div>
    </div>
  );
}
