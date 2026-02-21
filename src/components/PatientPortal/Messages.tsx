import React, { useState, useEffect, useRef } from 'react';
import './Messages.css';

interface Message {
  id: number;
  sender: 'doctor' | 'patient' | 'lab';
  content: string;
  timestamp: string; // ISO string
  read: boolean;
}

interface Conversation {
  id: number;
  contactName: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    contactName: 'Dr. Smith',
    lastMessage: 'Your blood test looks great!',
    lastTimestamp: '2025-07-20T15:24:00Z',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'doctor',
        content: 'Hello! Your blood test looks great!',
        timestamp: '2025-07-20T15:20:00Z',
        read: true,
      },
      {
        id: 2,
        sender: 'patient',
        content: 'Thank you, doctor!',
        timestamp: '2025-07-20T15:24:00Z',
        read: true,
      },
    ],
  },
  {
    id: 2,
    contactName: 'Lab Tech',
    lastMessage: 'Please fast for 12 hours before next test.',
    lastTimestamp: '2025-07-19T10:15:00Z',
    unreadCount: 1,
    messages: [
      {
        id: 1,
        sender: 'lab',
        content: 'Please fast for 12 hours before next test.',
        timestamp: '2025-07-19T10:15:00Z',
        read: false,
      },
    ],
  },
];

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll chat to bottom when activeConvId or conversations change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, conversations]);

  // Focus input when switching conversations
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConvId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === activeConvId) {
        const newMsg: Message = {
          id: conv.messages.length + 1,
          sender: 'patient',
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
          read: true,
        };
        return {
          ...conv,
          lastMessage: newMsg.content,
          lastTimestamp: newMsg.timestamp,
          messages: [...conv.messages, newMsg],
          unreadCount: 0,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setNewMessage('');
  };

  const handleSelectConversation = (id: number) => {
    setActiveConvId(id);
    setNewMessage('');
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? { ...conv, unreadCount: 0, messages: conv.messages.map((m) => ({ ...m, read: true })) }
          : conv
      )
    );
  };

  return (
    <section className="messages-container">
      <h1 className="title">Your Messages</h1>
      <p className="subtitle">View and manage all your messages in one place.</p>

      <div className="messages-layout">
        {/* Conversation List */}
        <nav className="conversation-list" aria-label="Conversation List">
          {conversations.length === 0 && <p className="empty-message">No conversations available.</p>}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={`conversation-item ${conv.id === activeConvId ? 'active' : ''}`}
              onClick={() => handleSelectConversation(conv.id)}
              aria-current={conv.id === activeConvId ? 'true' : undefined}
            >
              <div className="conversation-name">{conv.contactName}</div>
              <div className="conversation-last-message" title={conv.lastMessage}>
                {conv.lastMessage.length > 40
                  ? conv.lastMessage.slice(0, 37) + '...'
                  : conv.lastMessage}
              </div>
              <div className="conversation-timestamp">{formatDate(conv.lastTimestamp)}</div>
              {conv.unreadCount > 0 && (
                <span className="unread-badge" aria-label={`${conv.unreadCount} unread messages`}>
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Chat Panel */}
        <section
          className={`chat-panel ${activeConvId ? '' : 'no-active'}`}
          aria-live="polite"
          aria-label="Chat panel"
        >
          {activeConversation ? (
            <>
              <header className="chat-header">
                <h2>{activeConversation.contactName}</h2>
              </header>

              <div
                className="chat-messages"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
              >
                {activeConversation.messages.length === 0 && (
                  <p className="empty-message">No messages yet.</p>
                )}
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.sender === 'patient' ? 'sent' : 'received'}`}
                    tabIndex={-1}
                    aria-label={`${msg.sender === 'patient' ? 'You' : activeConversation.contactName}: ${msg.content}`}
                  >
                    <p>{msg.content}</p>
                    <time className="message-time" dateTime={msg.timestamp}>
                      {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                className="chat-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                aria-label="Send new message"
              >
                <textarea
                  rows={2}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required
                  aria-required="true"
                  ref={inputRef}
                />
                <button type="submit" disabled={!newMessage.trim()} aria-label="Send message">
                  Send
                </button>
              </form>
            </>
          ) : (
            <p className="no-active-message">Select a conversation to start messaging.</p>
          )}
        </section>
      </div>
    </section>
  );
};

export default Messages;
