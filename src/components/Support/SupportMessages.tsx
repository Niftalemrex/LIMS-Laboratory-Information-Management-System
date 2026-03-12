import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Send, Paperclip, Search, User, Clock, Check, X } from 'lucide-react';
import './SupportMessages.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useSupportStore } from '../Support/SupportStore';
import type { Message, Attachment } from '../Support/SupportStore';

// Define TicketStatus including 'closed'
type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

const SupportMessages: React.FC = () => {
  const { t } = useAppSettings();
  const { messages: storeMessages, addMessage, conversations: storeConversations, updateConversation } = useSupportStore();

  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ---------------- Auto-select first conversation ----------------
  useEffect(() => {
    if (selectedConversationId === null && storeConversations.length > 0) {
      setSelectedConversationId(storeConversations[0]?.id ?? null);
    }
  }, [storeConversations, selectedConversationId]);
  

  // ---------------- Memoized Selected Conversation ----------------
  const selectedConversation = useMemo(
    () => storeConversations.find(c => c.id === selectedConversationId)!,
    [storeConversations, selectedConversationId]
);


  // ---------------- Filtered Conversations ----------------
  const filteredConversations = useMemo(
    () =>
      storeConversations.filter(conv => {
        const matchesSearch =
          conv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [storeConversations, searchTerm, statusFilter]
  );

  // ---------------- Messages for Selected Conversation ----------------
  const conversationMessages = useMemo(
    () =>
      selectedConversationId
        ? storeMessages.filter(msg => msg.conversationId === selectedConversationId)
        : [],
    [storeMessages, selectedConversationId]
  );

  // ---------------- Scroll to Bottom ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // ---------------- Send Message ----------------
// ---------------- Send Message ----------------
const handleSendMessage = useCallback(() => {
  if ((!newMessage.trim() && attachments.length === 0) || !selectedConversationId) return;

  const msg: Message = {
    id: Date.now(),
    sender: 'support',
    text: newMessage,
    timestamp: new Date().toISOString(),
    status: 'sent',
    conversationId: selectedConversationId,
    attachments: attachments.map((file, index) => {
      const type =
        file.type.startsWith('image')
          ? 'image'
          : file.type.includes('pdf') || file.type.includes('document')
          ? 'document'
          : 'other';
      return { id: index + 1, name: file.name, type, url: URL.createObjectURL(file) } as Attachment;
    }),
  };

  // ✅ Pass conversationId as second argument
  addMessage(msg, selectedConversationId);

  updateConversation(selectedConversationId, {
    lastMessage: msg.text || `Attachment (${attachments.length})`,
    updatedAt: new Date().toISOString(),
    unreadCount: 0,
  });

  setNewMessage('');
  setAttachments([]);
}, [newMessage, attachments, addMessage, updateConversation, selectedConversationId]);


  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments(prev => [...prev, ...Array.from(e.target.files ?? [])]);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ---------------- Status & Icons ----------------
  const getStatusBadge = useCallback(
    (status: TicketStatus) => {
      const statusMap: Record<TicketStatus, { label: string; color: string }> = {
        open: { label: t('open'), color: 'var(--color-blue)' },
        pending: { label: t('pending'), color: 'var(--color-orange)' },
        resolved: { label: t('resolved'), color: 'var(--color-green)' },
        closed: { label: t('closed'), color: 'var(--color-gray)' },
      };
      return <span className="status-badge" style={{ backgroundColor: statusMap[status].color }}>{statusMap[status].label}</span>;
    },
    [t]
  );

  const getMessageStatusIcon = useCallback((status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed') => {
    switch (status) {
      case 'sent': return <Clock size={12} className="status-icon" />;
      case 'delivered': return <Check size={12} className="status-icon" />;
      case 'read': return <Check size={12} className="status-icon read" />;
      default: return null;
    }
  }, []);

  const markAsResolved = useCallback((convId: number) => {
    updateConversation(convId, { status: 'resolved' });
  }, [updateConversation]);

  return (
    <div className="support-messages-container">
      {/* Sidebar */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h2>{t('support_conversations')}</h2>
          <div className="sidebar-controls">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={t('search_conversations')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Search conversations"
              />
            </div>
            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | TicketStatus)}
                aria-label="Filter by status"
              >
                <option value="all">{t('all_statuses')}</option>
                <option value="open">{t('open')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="resolved">{t('resolved')}</option>
                <option value="closed">{t('closed')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="conversations-list">
          {filteredConversations.length > 0 ? filteredConversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversationId === conv.id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
              onClick={() => setSelectedConversationId(conv.id)}
            >
              <div className="conversation-header">
                <div className="customer-name">{conv.customer}</div>
                <div className="conversation-time">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="conversation-subject">{conv.subject}</div>
              <div className="conversation-footer">
                <div className="conversation-preview">{conv.lastMessage.length > 50 ? `${conv.lastMessage.substring(0, 50)}...` : conv.lastMessage}</div>
                <div className="conversation-status">
                  {getStatusBadge(conv.status)}
                  {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-conversations">
              {searchTerm || statusFilter !== 'all' ? t('no_matching_conversations') : t('no_conversations_found')}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {selectedConversation ? (
          <>
            <div className="messages-header">
              <div className="header-left">
                <h3>{selectedConversation.customer}</h3>
                <div className="conversation-meta">
                  <span className="subject">{selectedConversation.subject}</span>
                  <span className="status">{getStatusBadge(selectedConversation.status)}</span>
                </div>
              </div>
              <div className="header-right">
                <button className="resolve-button" onClick={() => markAsResolved(selectedConversation.id)}>{t('mark_as_resolved')}</button>
              </div>
            </div>

            <div className="messages-list">
              {conversationMessages.length > 0 ? conversationMessages.map(message => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-content">
                    {message.sender === 'customer' && <div className="sender-avatar"><User size={20} /></div>}
                    <div className="message-bubble">
                      <div className="message-text">{message.text}</div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="attachments">
                          {message.attachments.map(att => (
                            <div key={att.id} className="attachment">
                              {att.type === 'image' ? <img src={att.url} alt={att.name} className="attachment-image" /> :
                                <a href={att.url} download={att.name} className="attachment-file">{att.name}</a>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="message-footer">
                        <time className="message-time">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                        {message.sender === 'support' && <div className="message-status">{getMessageStatusIcon(message.status)}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )) : <div className="empty-messages">{t('no_messages')}</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              {attachments.length > 0 && (
                <div className="attachments-preview">
                  {attachments.map((file, i) => (
                    <div key={i} className="attachment-preview">
                      <span>{file.name}</span>
                      <button className="remove-attachment" onClick={() => removeAttachment(i)} aria-label={`Remove attachment ${file.name}`}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="input-area">
                <label className="file-upload-button">
                  <Paperclip size={20} />
                  <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <input
                  type="text"
                  placeholder={t('type_your_message')}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  className="message-input"
                  aria-label="Type your message"
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && attachments.length === 0}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="empty-state">
              <h3>{t('select_conversation')}</h3>
              <p>{t('choose_conversation')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportMessages;
