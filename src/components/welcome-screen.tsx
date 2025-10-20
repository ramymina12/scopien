'use client';

import { Bot, MessageSquare } from 'lucide-react';
import MessageInput from './message-input';
import { useState } from 'react';

const suggestions = [
  "Explain quantum computing in simple terms",
  "Got any creative ideas for a 10 year old's birthday?",
  "How do I make an HTTP request in Javascript?",
];

interface WelcomeScreenProps {
    onNewChat: (message: string) => void;
}

export function WelcomeScreen({ onNewChat }: WelcomeScreenProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    setIsSending(true);
    onNewChat(suggestion);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center bg-background">
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="mb-6 p-4 rounded-full bg-primary/10">
          <Bot className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">How can I help you today?</h1>
        <p className="text-muted-foreground">Choose a suggestion below or type your own message</p>
      </div>
      <div className="w-full max-w-4xl px-6 pb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(s)}
              className="p-4 bg-card border rounded-lg hover:bg-accent hover:border-primary transition-colors text-left text-sm shadow-sm"
            >
              <MessageSquare className="h-4 w-4 mb-2 text-primary" />
              <p className="font-medium">{s}</p>
            </button>
          ))}
        </div>
        <MessageInput onSendMessage={onNewChat} isLoading={isSending} />
      </div>
    </div>
  );
}
