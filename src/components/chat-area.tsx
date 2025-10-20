'use client';

import { useChat } from '@/contexts/chat-provider';
import { WelcomeScreen } from './welcome-screen';
import MessageInput from './message-input';
import { ScrollArea } from './ui/scroll-area';
import MessageBubble from './message-bubble';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { useAuth } from '@/contexts/auth-provider';
import { useEffect, useRef } from 'react';
import { Separator } from './ui/separator';
import { Spinner } from './spinner';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Bot } from 'lucide-react';

export default function ChatArea() {
  const { activeSession, sendMessage, isSendingMessage } = useChat();
  const { user } = useAuth();
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  if (!activeSession) {
    return <WelcomeScreen onNewChat={sendMessage} />;
  }

  return (
    <div className="flex flex-1 flex-col h-screen bg-background">
      <main className="flex-1 overflow-hidden bg-background">
        <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
          <div className="mx-auto max-w-4xl p-6 space-y-6">
            {activeSession.messages.map((message) => (
              <MessageBubble key={message.id} message={message} user={user} />
            ))}
            {isSendingMessage && (
              <div className="flex items-start gap-4">
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </Avatar>
                <div className="flex flex-col gap-1 w-full items-start">
                  <div className="max-w-4xl rounded-lg p-4 w-full bg-card border shadow-sm">
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
      <footer className="shrink-0 border-t bg-card p-4 shadow-sm">
        <div className="mx-auto max-w-4xl">
          <MessageInput onSendMessage={sendMessage} isLoading={isSendingMessage} />
        </div>
      </footer>
    </div>
  );
}
