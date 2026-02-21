import React, { useState, useEffect } from 'react';
import { 
  FiCircle,
  FiUser,
  FiMail,
  FiShield,
  FiClock,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiMoreVertical
} from 'react-icons/fi';
import './Monitoring.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useSystemLogs } from '../contexts/SystemLogsContext';
//import { st } from '../utils/api'; // ✅ standard fetch wrapper

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: 'Online' | 'Offline' | 'Idle';
  tenant: string;
  avatar?: string;
}

const Monitoring: React.FC = () => {
  const { t } = useAppSettings();
  const { logs } = useSystemLogs(); // 🔄 triggers refresh if logs change
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  useEffect(() => {
    // ✅ fetch tenants dynamically
    const fetchUsers = async () => {
      try {
        const data = await st('api/system/logs/', { method: 'GET' });
        if (Array.isArray(data)) {
          const mapped: User[] = data.map((tenant: any) => ({
            id: tenant.id,
            name: tenant.companyName || tenant.name || 'Unknown',
            email: tenant.email || 'N/A',
            role: tenant.role || 'User',
            lastLogin: tenant.createdAt || new Date().toISOString(),
            status: tenant.isActive ? 'Online' : 'Offline',
            tenant: tenant.id,
            avatar: (tenant.companyName || tenant.name || '?')
              .split(' ')
              .map((w: string) => w[0])
              .join('')
          }));
          setUsers(mapped);
        }
      } catch (error) {
        console.error('Failed to load tenants:', error);
      }
    };

    fetchUsers();
  }, [logs]);

  const roles = ['All', ...Array.from(new Set(users.map(u => u.role)))];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const StatusIndicator = ({ status }: { status: User['status'] }) => {
    const statusClasses = {
      Online: 'online',
      Offline: 'offline',
      Idle: 'idle'
    };
    return (
      <div className="status-indicator">
        <FiCircle className={`status-icon ${statusClasses[status]}`} />
        <span>{t(`status_${status.toLowerCase()}`)}</span>
      </div>
    );
  };

  const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString();

  return (
    <div className="monitoring-container">
      <div className="monitoring-header">
        <div className="header-left">
          <h1 className="monitoring-title">{t('online_users')}</h1>
          <span className="user-count">{filteredUsers.length} {t('users')}</span>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <FiFilter className="filter-icon" />
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button className="refresh-button" onClick={() => window.location.reload()}>
            <FiRefreshCw className="refresh-icon" /> {t('refresh')}
          </button>
        </div>
      </div>

      <div className="monitoring-table-container">
        <table className="monitoring-table">
          <thead>
            <tr>
              <th className="user-avatar"></th>
              <th>{t('name')}</th>
              <th>{t('email')}</th>
              <th>{t('role')}</th>
              <th>{t('last_login')}</th>
              <th>{t('status')}</th>
              <th className="actions-column"></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">{t('no_users_found')}</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="user-avatar">
                    <div className="avatar">{user.avatar || <FiUser className="default-avatar" />}</div>
                  </td>
                  <td className="user-name">
                    <div>{user.name}</div>
                    <div className="user-id">ID: {user.id}</div>
                  </td>
                  <td className="user-email"><FiMail className="email-icon" /> {user.email}</td>
                  <td className="user-role"><FiShield className="role-icon" /> {user.role}</td>
                  <td className="last-login"><FiClock className="clock-icon" /> {formatDateTime(user.lastLogin)}</td>
                  <td className="user-status"><StatusIndicator status={user.status} /></td>
                  <td className="actions-column">
                    <button className="action-button"><FiMoreVertical /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Monitoring;
