'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from './auth-provider';
import type { ChatState, ChatSession, Message } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { generateChatTitle } from '@/ai/flows/generate-chat-title';

interface ChatContextType {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
  activeSession: ChatSession | null;
  isSendingMessage: boolean;
  selectSession: (sessionId: string | null) => void;
  createNewSession: () => void;
  deleteSession: (sessionId: string) => void;
  sendMessage: (message: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialState: ChatState = {
  sessions: {},
  activeSessionId: null,
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<ChatState>(initialState);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const getStorageKey = useCallback((uid: string) => `scopieChatState_${uid}`, []);

  useEffect(() => {
    if (user) {
      try {
        const savedState = localStorage.getItem(getStorageKey(user.uid));
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Simple validation
          if (parsedState.sessions && typeof parsedState.activeSessionId !== 'undefined') {
            setState(parsedState);
          }
        } else {
           setState(initialState);
        }
      } catch (error) {
        console.error("Failed to load chat state from localStorage", error);
        setState(initialState);
      }
    } else {
      setState(initialState);
    }
  }, [user, getStorageKey]);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(getStorageKey(user.uid), JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save chat state to localStorage", error);
      }
    }
  }, [state, user, getStorageKey]);

  const selectSession = useCallback(async (sessionId: string | null) => {
    if (sessionId && state.sessions[sessionId] && !state.sessions[sessionId].historyFetched) {
        try {
            const response = await fetch(`https://ai.scopien.com/webhook/9b5c21d6-370f-4a03-bed3-3e2b3da92c8b?sessionId=${sessionId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            const fetchedMessages: Message[] = data.messages.map((msg: any, index: number) => ({
                id: `${sessionId}-hist-${index}`,
                type: msg.type,
                content: msg.data.content,
                timestamp: new Date().toISOString()
            }));

            setState(prevState => ({
                ...prevState,
                activeSessionId: sessionId,
                sessions: {
                    ...prevState.sessions,
                    [sessionId]: {
                        ...prevState.sessions[sessionId],
                        messages: fetchedMessages,
                        messageCount: fetchedMessages.length,
                        historyFetched: true,
                    }
                }
            }));
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
            toast({ variant: 'destructive', title: 'Error', description: `Failed to fetch history: ${error instanceof Error ? error.message : String(error)}` });
            setState(prevState => ({ ...prevState, activeSessionId: sessionId }));
        }
    } else {
        setState(prevState => ({ ...prevState, activeSessionId: sessionId }));
    }
  }, [state.sessions, toast]);

  const createNewSession = useCallback(() => {
    setState(prevState => ({ ...prevState, activeSessionId: null }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setState(prevState => {
      const newSessions = { ...prevState.sessions };
      delete newSessions[sessionId];
      return {
        ...prevState,
        sessions: newSessions,
        activeSessionId: prevState.activeSessionId === sessionId ? null : prevState.activeSessionId,
      };
    });
  }, []);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    setIsSendingMessage(true);

    let currentSessionId = state.activeSessionId;
    let isNewSession = false;
    
    // Create a new session if one doesn't exist
    if (!currentSessionId) {
      isNewSession = true;
      currentSessionId = `session_${new Date().getTime()}`;
      const newSession: ChatSession = {
        id: currentSessionId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        messageCount: 0,
        historyFetched: true, // New session history is local, so no need to fetch
      };
      setState(prevState => ({
        ...prevState,
        sessions: { ...prevState.sessions, [currentSessionId!]: newSession },
        activeSessionId: currentSessionId,
      }));
    }

    const humanMessage: Message = {
      id: `msg_${new Date().getTime()}`,
      type: 'human',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setState(prevState => {
        const session = prevState.sessions[currentSessionId!];
        if (!session) return prevState;
        const updatedMessages = [...session.messages, humanMessage];
        return {
            ...prevState,
            sessions: {
                ...prevState.sessions,
                [currentSessionId!]: {
                    ...session,
                    messages: updatedMessages,
                    messageCount: updatedMessages.length,
                }
            }
        };
    });

    if (isNewSession) {
      generateChatTitle({
        messages: [{ type: 'human', data: { content: messageContent } }]
      }).then(({ title }) => {
        setState(prevState => {
          const session = prevState.sessions[currentSessionId!];
          if (!session) return prevState;
          return {
            ...prevState,
            sessions: { ...prevState.sessions, [currentSessionId!]: { ...session, title } }
          };
        });
      }).catch(err => console.error("Error generating title:", err));
    }

    try {
      const response = await fetch('https://ai.scopien.com/webhook/7742abaa-046a-4362-ab28-b89393574ae6/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          sessionId: currentSessionId,
          timestamp: humanMessage.timestamp,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
      }

      const responseData = await response.json();
      let aiContent = '';
      if (Array.isArray(responseData) && responseData.length > 0) {
        aiContent = responseData[0].output;
      } else if (responseData && responseData.output) {
        aiContent = responseData.output;
      } else {
        throw new Error('Invalid API response format');
      }

      const aiMessage: Message = {
        id: `msg_${new Date().getTime() + 1}`,
        type: 'ai',
        content: aiContent,
        timestamp: new Date().toISOString(),
      };
      
      setState(prevState => {
        const session = prevState.sessions[currentSessionId!];
        if (!session) return prevState;
        const updatedMessages = [...session.messages, aiMessage];
        return {
            ...prevState,
            sessions: {
                ...prevState.sessions,
                [currentSessionId!]: {
                    ...session,
                    messages: updatedMessages,
                    messageCount: updatedMessages.length,
                }
            }
        };
      });

    } catch (error) {
      const err = error as Error;
      console.error('Failed to send message:', err);
      const errorMessage: Message = {
        id: `err_${new Date().getTime()}`,
        type: 'error',
        content: `Failed to get response: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      
      setState(prevState => {
        const session = prevState.sessions[currentSessionId!];
        if (!session) return prevState;
        const updatedMessages = [...session.messages, errorMessage];
        return {
            ...prevState,
            sessions: {
                ...prevState.sessions,
                [currentSessionId!]: {
                    ...session,
                    messages: updatedMessages,
                    messageCount: updatedMessages.length,
                }
            }
        };
      });
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  const activeSession = state.activeSessionId ? state.sessions[state.activeSessionId] : null;

  return (
    <ChatContext.Provider
      value={{
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        activeSession,
        isSendingMessage,
        selectSession,
        createNewSession,
        deleteSession,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
