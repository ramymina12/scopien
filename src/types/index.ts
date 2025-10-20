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

export type UserRole = 'admin' | 'user' | 'guest';

export type UserPermissions = {
  chatWebhook: boolean;
  historyWebhook: boolean;
  canManageUsers?: boolean;
  canManageWebhooks?: boolean;
};

export type AppUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: string;
  updatedAt: string;
};

export type WebhookConfig = {
  id: string;
  userId: string;
  chatWebhookUrl: string;
  historyWebhookUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};