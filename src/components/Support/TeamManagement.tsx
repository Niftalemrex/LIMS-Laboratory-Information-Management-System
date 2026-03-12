import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Edit, Trash2, User, Mail, Phone, Users } from 'lucide-react';
import './TeamManagement.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

type TeamMemberRole = 'admin' | 'manager' | 'developer' | 'designer' | 'support' | 'doctor' | 'technician';
type TeamMemberStatus = 'active' | 'on leave' | 'inactive';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: TeamMemberRole;
  department: string;
  status: TeamMemberStatus;
  joinDate: string;
  lastActive: string;
}

const API_USERS = 'http://127.0.0.1:8000/api/tenant/users/';

const TeamManagement: React.FC<{ tenantId?: number }> = ({ tenantId = 1 }) => {
  const { t } = useAppSettings();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<TeamMemberRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TeamMemberStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TeamMember; direction: 'asc' | 'desc' } | null>(null);
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);

  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'developer' as TeamMemberRole,
    department: '',
    status: 'active' as TeamMemberStatus
  });

  // Fetch users from tenant endpoint
  const fetchUsers = async (tenantId: number) => {
    if (!tenantId) {
      console.warn('fetchUsers called without a tenantId.');
      return;
    }
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_USERS}?tenant=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: any[] = await res.json();

      // ✅ Map all users correctly with safe defaults
      const mappedTeam: TeamMember[] = data.map(u => ({
        id: u.id,
        name: u.name ?? 'N/A',
        email: u.email ?? 'noemail@example.com',
        phone: u.phone ?? '',
        role: u.role as TeamMemberRole,
        department: u.department ?? 'General',
        status: (u.status as TeamMemberStatus) ?? 'active',
        joinDate: u.joinDate ?? new Date().toISOString().split('T')[0],
        lastActive: u.lastActive ?? new Date().toISOString()
      }));

      setTeam(mappedTeam);
    } catch (err) {
      console.error(err);
      alert(t('failed_fetch_users'));
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers(tenantId);
  }, [tenantId]);

  const resetForm = () => setNewMemberForm({
    name: '',
    email: '',
    phone: '',
    role: 'developer',
    department: '',
    status: 'active'
  });

  // Filtering
  const filteredTeam = useMemo(() => {
    return team.filter(member => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [team, searchTerm, roleFilter, statusFilter]);

  // Sorting
  const sortedTeam = useMemo(() => {
    if (!sortConfig) return filteredTeam;
    return [...filteredTeam].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTeam, sortConfig]);

  const requestSort = (key: keyof TeamMember) => {
    setSortConfig(prev =>
      prev && prev.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const addNewMember = () => {
    if (!newMemberForm.name.trim() || !newMemberForm.email.trim()) {
      alert(t('fill_required_fields'));
      return;
    }
   
   
  };

  const updateMember = () => {
    setTeam(prev =>
      prev.map(member =>
        member.id === editMode ? { ...member, ...newMemberForm } : member
      )
    );
    setEditMode(null);
    resetForm();
    setShowNewMemberForm(false);
  };

  const deleteMember = (id: number) => {
    if (window.confirm(t('confirm_remove_member'))) {
      setTeam(prev => prev.filter(member => member.id !== id));
      if (editMode === id) setEditMode(null);
    }
  };

  const startEdit = (member: TeamMember) => {
    setEditMode(member.id);
    setNewMemberForm({ ...member });
    setShowNewMemberForm(true);
  };

  const cancelEdit = () => { setEditMode(null); resetForm(); setShowNewMemberForm(false); };

  const getRoleBadge = (role: TeamMemberRole) => {
    const roleMap: Record<TeamMemberRole, { label: string; color: string }> = {
      admin: { label: t('admin'), color: 'var(--color-purple)' },
      manager: { label: t('manager'), color: 'var(--color-blue)' },
      developer: { label: t('developer'), color: 'var(--color-green)' },
      designer: { label: t('designer'), color: 'var(--color-orange)' },
      support: { label: t('support'), color: 'var(--color-teal)' },
      doctor: { label: t('doctor'), color: 'var(--color-pink)' },
      technician: { label: t('technician'), color: 'var(--color-cyan)' }
    };
    return <span className="role-badge" style={{ backgroundColor: roleMap[role].color }}>{roleMap[role].label}</span>;
  };

  const getStatusBadge = (status: TeamMemberStatus) => {
    const statusMap: Record<TeamMemberStatus, { label: string; color: string }> = {
      active: { label: t('active'), color: 'var(--color-green)' },
      'on leave': { label: t('on_leave'), color: 'var(--color-yellow)' },
      inactive: { label: t('inactive'), color: 'var(--color-red)' }
    };
    return <span className="status-badge" style={{ backgroundColor: statusMap[status].color }}>{statusMap[status].label}</span>;
  };

  if (loadingUsers) return <div>{t('loading_users')}</div>;

  // ✅ Full JSX return
  return (
    <div className="team-management-container">
      {/* Header */}
      <header className="team-header">
        <div>
          <h1>{t('team_management')}</h1>
          <p className="subtitle">{t('manage_team_members')}</p>
        </div>
        <button className="new-member-button" onClick={() => { setShowNewMemberForm(!showNewMemberForm); setEditMode(null); }}>
          <Plus size={18} /> {t('add_member')}
        </button>
      </header>

      {/* Form */}
      {(showNewMemberForm || editMode !== null) && (
        <div className="member-form">
          <h3>{editMode !== null ? t('edit_team_member') : t('add_new_member')}</h3>
          <div className="form-grid">
            {['name','email','phone','department'].map(field => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{t(field)}{field==='name'||field==='email'?'*':''}</label>
                <input
                  type={field==='email'?'email':'text'}
                  id={field}
                  name={field}
                  value={newMemberForm[field as keyof typeof newMemberForm]}
                  onChange={handleInputChange}
                  placeholder={t(field==='name'?'john_doe':'engineering')}
                />
              </div>
            ))}
            <div className="form-group">
              <label htmlFor="role">{t('role')}</label>
              <select id="role" name="role" value={newMemberForm.role} onChange={handleInputChange}>
                {['admin','manager','developer','designer','support'].map(role => <option key={role} value={role}>{t(role)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">{t('status')}</label>
              <select id="status" name="status" value={newMemberForm.status} onChange={handleInputChange}>
                {['active','on leave','inactive'].map(status => <option key={status} value={status}>{t(status.replace(' ','_'))}</option>)}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="cancel-button" onClick={editMode !== null ? cancelEdit : () => setShowNewMemberForm(false)}>{t('cancel')}</button>
            <button className="submit-button" onClick={editMode !== null ? updateMember : addNewMember}>{editMode !== null ? t('update_member') : t('add_member')}</button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="team-controls">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('search_team_members')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
        </div>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="role-filter">{t('role')}</label>
            <select id="role-filter" value={roleFilter} onChange={e => setRoleFilter(e.target.value as TeamMemberRole | 'all')}>
              <option value="all">{t('all_roles')}</option>
              {['admin','manager','developer','designer','support'].map(role => <option key={role} value={role}>{t(role)}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="status-filter">{t('status')}</label>
            <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as TeamMemberStatus | 'all')}>
              <option value="all">{t('all_statuses')}</option>
              {['active','on leave','inactive'].map(status => <option key={status} value={status}>{t(status.replace(' ','_'))}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="team-table-container">
        <table className="team-table">
          <thead>
            <tr>
              {['name','role','department','status','joinDate'].map(key => (
                <th key={key} onClick={() => requestSort(key as keyof TeamMember)}>
                  <div className="header-cell">{t(key)}{sortConfig?.key===key?(sortConfig.direction==='asc'?<ChevronUp size={16}/>:<ChevronDown size={16}/>):null}</div>
                </th>
              ))}
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeam.length ? sortedTeam.map(member => (
              <React.Fragment key={member.id}>
                <tr className={`member-row ${expandedMember===member.id?'expanded':''}`} onClick={() => setExpandedMember(expandedMember===member.id?null:member.id)}>
                  <td><div className="member-name"><User size={18} className="user-icon"/>{member.name}</div></td>
                  <td>{getRoleBadge(member.role)}</td>
                  <td>{member.department}</td>
                  <td>{getStatusBadge(member.status)}</td>
                  <td><time dateTime={member.joinDate}>{new Date(member.joinDate).toLocaleDateString()}</time></td>
                  <td>
                    <div className="actions-cell">
                      <button aria-label={t('edit_member')} className="edit-button" onClick={e=>{e.stopPropagation(); startEdit(member);}}><Edit size={16}/></button>
                      <button aria-label={t('delete_member')} className="delete-button" onClick={e=>{e.stopPropagation(); deleteMember(member.id);}}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
                {expandedMember===member.id && (
                  <tr className="member-details-row">
                    <td colSpan={6}>
                      <div className="member-details">
                        <div className="details-grid">
                          <div className="detail-item"><Mail size={16} className="detail-icon"/><span>{member.email}</span></div>
                          <div className="detail-item"><Phone size={16} className="detail-icon"/><span>{member.phone || t('not_provided')}</span></div>
                          <div className="detail-item"><Users size={16} className="detail-icon"/><span>{t('last_active')}: {new Date(member.lastActive).toLocaleString()}</span></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr className="empty-row"><td colSpan={6}><div className="empty-state">{searchTerm||roleFilter!=='all'||statusFilter!=='all'?t('no_matching_members'):t('no_team_members')}</div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="team-summary">
        <div className="summary-card"><h3>{t('total_members')}</h3><p>{team.length}</p></div>
        <div className="summary-card"><h3>{t('active')}</h3><p>{team.filter(m=>m.status==='active').length}</p></div>
        <div className="summary-card"><h3>{t('on_leave')}</h3><p>{team.filter(m=>m.status==='on leave').length}</p></div>
        <div className="summary-card"><h3>{t('departments')}</h3><p>{[...new Set(team.map(m=>m.department))].length}</p></div>
      </div>
    </div>
  );
};

export default TeamManagement;