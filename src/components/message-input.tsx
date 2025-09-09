'use client';

import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, CornerDownLeft } from 'lucide-react';
import { Spinner } from './spinner';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message here..."
        className="pr-24 min-h-[52px] resize-none"
        disabled={isLoading}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
         <p className="text-xs text-muted-foreground hidden md:block">
            <CornerDownLeft className="inline h-3 w-3" /> to send
         </p>
        <Button type="submit" size="icon" disabled={isLoading || !message.trim()}>
          {isLoading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
}
