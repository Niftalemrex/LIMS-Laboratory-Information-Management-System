// src/stores/SupportStore.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

// ---------------- TYPES ----------------
export type MessageSender = 'user' | 'bot' | 'agent' | 'support' | 'customer';
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Attachment {
  id: number;
  name: string;
  type: 'image' | 'document' | 'other';
  url: string;
}

export interface Message {
  id: number;
  sender: MessageSender;
  text: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Attachment[];
  conversationId: number;
}

export interface Conversation {
  id: number;
  customer: string;
  subject: string;
  status: TicketStatus;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
  messages: Message[];
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  createdBy: string;
  messages: number;
}

// ---------------- CONTEXT ----------------
interface SupportStoreContextProps {
  messages: Message[];
  conversations: Conversation[];
  tickets: Ticket[];
  addMessage: (msg: Message, conversationId: number) => void; // ✅ 2 args
  addConversation: (conv: Conversation) => void;
  updateConversation: (conversationId: number, update: Partial<Conversation>) => void;
  updateTicket: (ticket: Ticket) => void;
  markConversationAsRead: (conversationId: number) => void;
}

const LOCAL_STORAGE_KEY = 'support_store';
const SupportStoreContext = createContext<SupportStoreContextProps | undefined>(undefined);

// ---------------- PROVIDER ----------------
interface ProviderProps {
  children: ReactNode;
}

export const SupportStoreProvider: React.FC<ProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      setMessages(parsed.messages ?? []);
      setConversations(parsed.conversations ?? []);
      setTickets(parsed.tickets ?? []);
    } catch (err) {
      console.error('Failed to load support store from localStorage:', err);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ messages, conversations, tickets })
      );
    } catch (err) {
      console.error('Failed to save support store to localStorage:', err);
    }
  }, [messages, conversations, tickets]);

  // ---------------- HELPERS ----------------
  const addConversation = (conv: Conversation) => {
    setConversations(prev => [...prev, conv]);
  };

  const addMessage = (msg: Message, conversationId: number) => {
    setMessages(prev => [...prev, msg]);

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, msg],
              lastMessage: msg.text,
              updatedAt: new Date().toISOString(),
              unreadCount:
                conv.unreadCount + (msg.sender === 'customer' ? 1 : 0),
            }
          : conv
      )
    );
  };

  const updateConversation = (conversationId: number, update: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(conv => (conv.id === conversationId ? { ...conv, ...update } : conv))
    );
  };

  const updateTicket = (ticket: Ticket) => {
    setTickets(prev => prev.map(t => (t.id === ticket.id ? ticket : t)));
  };

  const markConversationAsRead = (conversationId: number) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      messages,
      conversations,
      tickets,
      addMessage,
      addConversation,
      updateConversation,
      updateTicket,
      markConversationAsRead,
    }),
    [messages, conversations, tickets]
  );

  return (
    <SupportStoreContext.Provider value={contextValue}>
      {children}
    </SupportStoreContext.Provider>
  );
};

// ---------------- HOOK ----------------
export const useSupportStore = (): SupportStoreContextProps => {
  const context = useContext(SupportStoreContext);
  if (!context) throw new Error('useSupportStore must be used within SupportStoreProvider');
  return context;
};
