export type Message = {
  id: string;
  type: 'human' | 'ai' | 'error';
  content: string;
  timestamp: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  messageCount: number;
  historyFetched: boolean;
};

export type ChatState = {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
};
