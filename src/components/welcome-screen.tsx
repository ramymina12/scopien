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
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <Bot className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-4xl font-bold">How can I help you today?</h1>
      </div>
      <div className="w-full max-w-3xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(s)}
              className="p-4 border rounded-lg hover:bg-secondary text-left text-sm"
            >
              <p className="font-semibold">{s}</p>
            </button>
          ))}
        </div>
        <MessageInput onSendMessage={onNewChat} isLoading={isSending} />
      </div>
    </div>
  );
}
