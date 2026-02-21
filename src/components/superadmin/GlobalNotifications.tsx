import React, { useEffect, useState } from 'react';
import { 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiFilter,
  FiPlus,
  FiSearch,
  FiChevronDown
} from 'react-icons/fi';
import './GlobalNotifications.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useSystemLogs } from '../contexts/SystemLogsContext';
//import { st } from '../utils/api'; // ✅ API wrapper

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  status: 'Sent' | 'Pending' | 'Failed';
  priority?: 'low' | 'medium' | 'high';
}

const GlobalNotifications: React.FC = () => {
  const { t } = useAppSettings();
  const { logs } = useSystemLogs();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // ✅ API request (superadmin tenants used as example source)
        const data = await st('api/system/logs/', { method: 'GET' });
        let mapped: Notification[] = [];

        if (Array.isArray(data)) {
          mapped = data.map((tenant: any) => ({
            id: tenant.id,
            title: tenant.companyName || 'Tenant Registered',
            message: tenant.email || 'No message',
            date: tenant.createdAt || new Date().toISOString(),
            status: tenant.isActive ? 'Sent' : 'Pending',
            priority: 'medium'
          }));
        }

        // ✅ Also include logs (system-wide events)
        if (logs && logs.length > 0) {
          const mappedLogs: Notification[] = logs.map((log: any) => ({
            id: log.id || log.timestamp,
            title: log.action || 'System Action',
            message: log.details || '',
            date: log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString(),
            status: log.status === 'Success' ? 'Sent' 
                    : log.status === 'Pending' ? 'Pending' 
                    : 'Failed',
            priority: log.severity || 'medium'
          }));
          mapped = [...mapped, ...mappedLogs];
        }

        setNotifications(mapped.reverse()); // newest first
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    fetchNotifications();
  }, [logs]);

  const StatusIcon = ({ status }: { status: Notification['status'] }) => {
    switch (status) {
      case 'Sent':
        return <FiCheckCircle className="status-icon" />;
      case 'Pending':
        return <FiClock className="status-icon" />;
      case 'Failed':
        return <FiAlertCircle className="status-icon" />;
      default:
        return null;
    }
  };

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="global-notifications-container">
      <div className="gn-header">
        <div className="gn-header-left">
          <h1 className="gn-title">{t('global_notifications')}</h1>
          <span className="gn-badge">{filteredNotifications.length} {t('notifications')}</span>
        </div>
        
        <div className="gn-actions">
          <div className="gn-search">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder={t('search_placeholder')} 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="gn-filters">
            <button className="filter-button">
              <FiFilter className="button-icon" />
              {t('filter')}
              <FiChevronDown className="chevron-icon" />
            </button>
          </div>
          
          <button className="gn-primary-button">
            <FiPlus className="button-icon" />
            {t('new_notification')}
          </button>
        </div>
      </div>

      <div className="gn-table-container">
        <table className="gn-table">
          <thead>
            <tr>
              <th>{t('id')}</th>
              <th>{t('title')}</th>
              <th>{t('message')}</th>
              <th>{t('date')}</th>
              <th>{t('status')}</th>
              <th>{t('priority')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">{t('no_notifications')}</td>
              </tr>
            ) : (
              filteredNotifications.map((notif) => (
                <tr key={notif.id} className={`priority-${notif.priority}`}>
                  <td className="id-cell">#{notif.id}</td>
                  <td className="title-cell">{notif.title}</td>
                  <td className="message-cell">{notif.message}</td>
                  <td className="date-cell">{new Date(notif.date).toLocaleDateString()}</td>
                  <td className={`status-cell ${notif.status.toLowerCase()}`}>
                    <StatusIcon status={notif.status} />
                    {t(`status_${notif.status.toLowerCase()}`)}
                  </td>
                  <td className={`priority-cell ${notif.priority}`}>
                    {t(`priority_${notif.priority}`)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="gn-footer">
        <div className="gn-pagination">
          <button className="pagination-button disabled">{t('previous')}</button>
          <button className="pagination-button active">1</button>
          <button className="pagination-button">2</button>
          <button className="pagination-button">3</button>
          <button className="pagination-button">{t('next')}</button>
        </div>
      </div>
    </div>
  );
};

export default GlobalNotifications;
