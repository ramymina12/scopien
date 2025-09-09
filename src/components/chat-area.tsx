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
    <div className="flex flex-1 flex-col h-screen">
      <header className="flex h-16 items-center border-b bg-background px-6">
        <h2 className="text-lg font-semibold">{activeSession.title}</h2>
      </header>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
          <div className="p-6 space-y-6">
            {activeSession.messages.map((message) => (
              <MessageBubble key={message.id} message={message} user={user} />
            ))}
          </div>
        </ScrollArea>
      </main>
      <footer className="border-t bg-background p-4">
        <MessageInput onSendMessage={sendMessage} isLoading={isSendingMessage} />
      </footer>
    </div>
  );
}
