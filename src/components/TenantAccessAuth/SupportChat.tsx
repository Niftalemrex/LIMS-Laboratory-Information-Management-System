import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './SupportChat.css';
import { useSupportStore } from '../Support/SupportStore';
import type { Message, Conversation } from '../Support/SupportStore';

interface SupportChatProps {
  botName?: string;
  botAvatar?: string;
  userAvatar?: string;
  autoResponse?: boolean;
  responseDelay?: number;
  placeholderText?: string;
  showTypingIndicator?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  conversationId?: number;
}

const SupportChat: React.FC<SupportChatProps> = ({
  botName = 'Support Agent',
  botAvatar = '🤖',
  userAvatar = '👤',
  autoResponse = true,
  responseDelay = 1000,
  placeholderText = 'Type your message...',
  showTypingIndicator = true,
  theme = 'light',
  conversationId,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages: storeMessages, addMessage, conversations, addConversation, markConversationAsRead } =
    useSupportStore();

  // ---------------- THEME ----------------
  const currentTheme = useMemo(() => {
    if (theme === 'auto') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }, [theme]);

  // ---------------- Filter messages ----------------
  const conversationMessages = useMemo(() => {
    if (conversationId != null) {
      return storeMessages.filter(msg => msg.conversationId === conversationId);
    }
    return storeMessages;
  }, [storeMessages, conversationId]);

  // ---------------- Auto Scroll ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, isTyping]);

  // ---------------- Bot Response ----------------
  const simulateBotResponse = useCallback(
    (userMessage: string, convId: number) => {
      if (!autoResponse) return;

      setIsTyping(true);
      const responseText = /hi|hello/i.test(userMessage.toLowerCase())
        ? 'Hello! How can I assist you today?'
        : 'I’ve forwarded your message to our support team. 👨‍💻';

      setTimeout(() => {
        setIsTyping(false);
        addMessage(
          {
            id: Date.now() + Math.random(),
            sender: 'bot',
            text: responseText,
            timestamp: new Date().toISOString(),
            conversationId: convId,
          },
          convId
        );
      }, responseDelay);
    },
    [autoResponse, addMessage, responseDelay]
  );

  // ---------------- Send User Message ----------------
  const handleSendMessage = useCallback(() => {
    const text = newMessage.trim();
    if (!text) return;

    let convId = conversationId;

    // Create a new conversation if missing
    if (convId == null) {
      const newConv: Conversation = {
        id: Date.now(),
        customer: 'You',
        subject: 'New Support Chat',
        status: 'open',
        lastMessage: text,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      addConversation(newConv);
      convId = newConv.id;
    }

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      conversationId: convId,
    };

    addMessage(userMsg, convId);
    setNewMessage('');

    // simulate sent confirmation
    setTimeout(() => {
      addMessage({ ...userMsg, status: 'sent' }, convId!);
    }, 300);

    simulateBotResponse(text, convId);
  }, [newMessage, addMessage, addConversation, simulateBotResponse, conversationId]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    const open = !chatOpen;
    setChatOpen(open);
    if (open && conversationId != null) {
      setUnreadCount(0);
      markConversationAsRead(conversationId);
    }
  };

  return (
    <div className={`support-chat-wrapper ${currentTheme}-theme`}>
      <button
        className={`support-button ${chatOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle support chat"
      >
        💬
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {chatOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <div className="chat-title">
              <span className="bot-avatar">{botAvatar}</span>
              <div>
                <h3>{botName}</h3>
                <div className="status">
                  <span className="status-indicator" aria-hidden="true"></span>
                  <span className="status-text">Online</span>
                </div>
              </div>
            </div>
            <button className="close-chat" onClick={() => setChatOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {conversationMessages.length === 0 && (
              <div className="empty-state">
                <p>How can we help you today?</p>
                <small>We typically reply within a few minutes</small>
              </div>
            )}

            {conversationMessages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === 'bot' ? botAvatar : msg.sender === 'agent' ? '👨‍💼' : userAvatar}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <div className="message-text">{msg.text}</div>
                    <div className="message-meta">
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender === 'user' && msg.status && (
                        <span className="message-status">{msg.status === 'sent' ? '✓' : '!'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && showTypingIndicator && (
              <div className="message bot">
                <div className="message-avatar">{botAvatar}</div>
                <div className="message-content">
                  <div className="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <textarea
              placeholder={placeholderText}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              aria-label="Type your message"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
