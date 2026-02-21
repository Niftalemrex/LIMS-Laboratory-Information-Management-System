import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, MessageSquare, AlertCircle, Check, X, Clock } from 'lucide-react';
import './SupportTickets.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

interface Ticket {
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

const LOCAL_STORAGE_KEY = 'support_tickets';

const SupportTickets: React.FC = () => {
  const { t } = useAppSettings();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ticket; direction: 'asc' | 'desc' } | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [newTicketForm, setNewTicketForm] = useState({ title: '', description: '', priority: 'medium' as TicketPriority });
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const storedTickets = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTickets) setTickets(JSON.parse(storedTickets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  // ---------------- Handlers ----------------
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewTicketForm(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const createNewTicket = useCallback(() => {
    if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) {
      alert(t('fill_required_fields'));
      return;
    }

    const newTicket: Ticket = {
      id: tickets.length ? Math.max(...tickets.map(t => t.id)) + 1 : 1,
      title: newTicketForm.title,
      description: newTicketForm.description,
      status: 'open',
      priority: newTicketForm.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: t('unassigned'),
      createdBy: t('current_user'),
      messages: 0
    };

    setTickets([newTicket, ...tickets]);
    setNewTicketForm({ title: '', description: '', priority: 'medium' });
    setShowNewTicketForm(false);
  }, [newTicketForm, tickets, t]);

  const updateTicketStatus = useCallback((id: number, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
  }, []);

  const requestSort = useCallback((key: keyof Ticket) => {
    setSortConfig(prev => {
      if (prev?.key === key) return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      return { key, direction: 'asc' };
    });
  }, []);

  // ---------------- Filtered & Sorted Tickets ----------------
  const filteredTickets = useMemo(() => 
    tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    }),
    [tickets, searchTerm, statusFilter, priorityFilter]
  );

  const sortedTickets = useMemo(() => {
    if (!sortConfig) return filteredTickets;
    return [...filteredTickets].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sortConfig]);

  // ---------------- Priority & Status Helpers ----------------
  const getPriorityIcon = useCallback((priority: TicketPriority) => {
    switch(priority) {
      case 'low': return <span className="priority-dot low" />;
      case 'medium': return <span className="priority-dot medium" />;
      case 'high': return <span className="priority-dot high" />;
      case 'critical': return <AlertCircle size={16} className="critical-icon" />;
    }
  }, []);

  const getTranslatedPriority = useCallback((priority: TicketPriority) => {
    switch(priority) {
      case 'low': return t('low');
      case 'medium': return t('medium');
      case 'high': return t('high');
      case 'critical': return t('critical');
    }
  }, [t]);

  const getStatusBadge = useCallback((status: TicketStatus) => {
    return <span className={`status-badge ${status}`}>{t(status)}</span>;
  }, [t]);

  // ---------------- Summary ----------------
  const summary = useMemo(() => ({
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    resolvedToday: tickets.filter(t => t.status === 'resolved' && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length,
    total: tickets.length
  }), [tickets]);

  // ---------------- Render ----------------
  return (
    <div className="support-tickets-container">
      {/* Header */}
      <header className="tickets-header">
        <div>
          <h1>{t('support_tickets')}</h1>
          <p className="subtitle">{t('manage_support_requests')}</p>
        </div>
        <button 
          className="new-ticket-button"
          onClick={() => setShowNewTicketForm(prev => !prev)}
        >
          <Plus size={18} /> {t('new_ticket')}
        </button>
      </header>

      {/* New Ticket Form */}
      {showNewTicketForm && (
        <div className="new-ticket-form">
          <h3>{t('create_new_ticket')}</h3>
          <div className="form-group">
            <label htmlFor="title">{t('title')}*</label>
            <input type="text" id="title" name="title" value={newTicketForm.title} onChange={handleInputChange} placeholder={t('issue_description_placeholder')} />
          </div>
          <div className="form-group">
            <label htmlFor="description">{t('description')}*</label>
            <textarea id="description" name="description" value={newTicketForm.description} onChange={handleInputChange} placeholder={t('problem_details_placeholder')} rows={4} />
          </div>
          <div className="form-group">
            <label htmlFor="priority">{t('priority')}</label>
            <select id="priority" name="priority" value={newTicketForm.priority} onChange={handleInputChange}>
              <option value="low">{t('low')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="high">{t('high')}</option>
              <option value="critical">{t('critical')}</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="cancel-button" onClick={() => setShowNewTicketForm(false)}>{t('cancel')}</button>
            <button className="submit-button" onClick={createNewTicket}>{t('create_ticket')}</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="tickets-controls">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('search_tickets_placeholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
        </div>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status-filter">{t('status')}</label>
            <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as TicketStatus | 'all')}>
              <option value="all">{t('all_statuses')}</option>
              <option value="open">{t('open')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="resolved">{t('resolved')}</option>
              <option value="closed">{t('closed')}</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="priority-filter">{t('priority')}</label>
            <select id="priority-filter" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as TicketPriority | 'all')}>
              <option value="all">{t('all_priorities')}</option>
              <option value="low">{t('low')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="high">{t('high')}</option>
              <option value="critical">{t('critical')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              {['title','status','priority','createdAt','assignedTo'].map((key) => (
                <th key={key} onClick={() => requestSort(key as keyof Ticket)}>
                  <div className="header-cell">
                    {t(key as keyof typeof t)}
                    {sortConfig?.key === key && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </div>
                </th>
              ))}
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.length ? sortedTickets.map(ticket => (
              <React.Fragment key={ticket.id}>
                <tr className={`ticket-row ${ticket.status} ${expandedTicket === ticket.id ? 'expanded' : ''}`} onClick={() => setExpandedTicket(prev => prev === ticket.id ? null : ticket.id)}>
                  <td>
                    <div className="ticket-title">
                      {ticket.title} <span className="messages-count"><MessageSquare size={14}/> {ticket.messages}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td>
                    <div className="priority-cell">{getPriorityIcon(ticket.priority)}<span className="priority-text">{getTranslatedPriority(ticket.priority)}</span></div>
                  </td>
                  <td><time dateTime={ticket.createdAt}>{new Date(ticket.createdAt).toLocaleDateString()}</time></td>
                  <td>{ticket.assignedTo}</td>
                  <td>
                    <div className="actions-cell">
                      {ticket.status === 'open' && <button className="action-button assign-button" onClick={(e) => { e.stopPropagation(); updateTicketStatus(ticket.id,'pending'); }}>{t('assign_to_me')}</button>}
                      {ticket.status === 'pending' && <button className="action-button resolve-button" onClick={(e) => { e.stopPropagation(); updateTicketStatus(ticket.id,'resolved'); }}><Check size={16}/> {t('resolve')}</button>}
                    </div>
                  </td>
                </tr>

                {expandedTicket === ticket.id && (
                  <tr className="ticket-details-row">
                    <td colSpan={6}>
                      <div className="ticket-details">
                        <div className="details-section"><h4>{t('description')}</h4><p>{ticket.description}</p></div>
                        <div className="details-grid">
                          <div className="detail-item"><span className="detail-label">{t('created_by')}:</span><span>{ticket.createdBy}</span></div>
                          <div className="detail-item"><span className="detail-label">{t('created')}:</span><span>{new Date(ticket.createdAt).toLocaleString()}</span></div>
                          <div className="detail-item"><span className="detail-label">{t('last_updated')}:</span><span>{new Date(ticket.updatedAt).toLocaleString()}</span></div>
                          <div className="detail-item"><span className="detail-label">{t('messages')}:</span><span>{ticket.messages}</span></div>
                        </div>
                        <div className="status-actions">
                          {(['open','pending','resolved','closed'] as TicketStatus[]).map(status => (
                            <button key={status} className={`status-action ${ticket.status===status?'active':''}`} onClick={() => updateTicketStatus(ticket.id,status)}>
                              {status==='open' && <Clock size={16}/>} {status==='pending' && <AlertCircle size={16}/>} {status==='resolved' && <Check size={16}/>} {status==='closed' && <X size={16}/>} {t(status)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr className="empty-row">
                <td colSpan={6}><div className="empty-state">{searchTerm || statusFilter!=='all' || priorityFilter!=='all' ? t('no_matching_tickets') : t('no_tickets_found')}</div></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="tickets-summary">
        <div className="summary-card"><h3>{t('open_tickets')}</h3><p>{summary.open}</p></div>
        <div className="summary-card"><h3>{t('pending_tickets')}</h3><p>{summary.pending}</p></div>
        <div className="summary-card"><h3>{t('resolved_today')}</h3><p>{summary.resolvedToday}</p></div>
        <div className="summary-card"><h3>{t('total_tickets')}</h3><p>{summary.total}</p></div>
      </div>
    </div>
  );
};

export default SupportTickets;
