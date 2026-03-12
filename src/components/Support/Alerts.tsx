import React, { useState, useEffect, useMemo } from 'react';
import { Info, AlertTriangle, AlertCircle, Bell, BellOff, Filter } from 'lucide-react';
import './Alerts.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useTenantLogs } from '../contexts/TenantLogsContext';


type AlertType = 'info' | 'warning' | 'critical';

// Define Alert independently – not extending TenantLogEntry
interface Alert {
  id: string;
  type: AlertType;
  message: string;
  status: string; // maybe not needed, but kept
  timestamp: string;
  // If you need more fields, add them explicitly
}

const Alerts: React.FC = () => {
  const { t } = useAppSettings();
  const { logs } = useTenantLogs();

  const [filter, setFilter] = useState<AlertType | 'all'>('all');
  const [muted, setMuted] = useState(false);
  const [persistedAlerts, setPersistedAlerts] = useState<Alert[]>([]);

  // Fetch persisted alerts once on mount
  useEffect(() => {
    const fetchPersistedAlerts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/alerts/');
        if (!res.ok) throw new Error('Failed to fetch persisted alerts');
        const data: Alert[] = await res.json();
        setPersistedAlerts(data);
      } catch (err) {
        console.error('Error fetching persisted alerts:', err);
      }
    };
    fetchPersistedAlerts();
  }, []);

  // Convert tenant logs to Alert format
  const logAlerts = useMemo(() => {
    return logs.map((log): Alert => ({
      id: log.id,
      type:
        log.status === 'Error' ? 'critical' :
        log.status === 'Warning' ? 'warning' : 'info',
      message: log.details || log.action || 'No message', // use details instead of message
      status: log.status || 'active',
      timestamp: log.timestamp || new Date().toISOString(),
    }));
  }, [logs]);

  // Combine persisted and log alerts, deduplicate by id
  const allAlerts: Alert[] = useMemo(() => {
    const combined = [...persistedAlerts, ...logAlerts];
    // Deduplicate by id (keep first occurrence, which will be persisted if present)
    const unique = new Map<string, Alert>();
    combined.forEach(alert => {
      if (!unique.has(alert.id)) unique.set(alert.id, alert);
    });
    const uniqueAlerts = Array.from(unique.values());
    // Sort descending by timestamp
    return uniqueAlerts.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [persistedAlerts, logAlerts]);

  // Sync new log alerts to backend (optional)
  useEffect(() => {
    const syncNewAlerts = async () => {
      for (const logAlert of logAlerts) {
        // Only post if not already persisted
        if (!persistedAlerts.some(p => p.id === logAlert.id)) {
          try {
            const payload = { ...logAlert };
            const res = await fetch('http://localhost:8000/api/alerts/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              setPersistedAlerts(prev => [...prev, logAlert]);
            } else {
              const errData = await res.json();
              console.error(`Failed to post alert ${logAlert.id}:`, errData);
            }
          } catch (err) {
            console.error(`Error syncing alert ${logAlert.id}:`, err);
          }
        }
      }
    };

    if (logAlerts.length > 0) syncNewAlerts();
  }, [logAlerts, persistedAlerts]);

  const toggleMute = () => setMuted(prev => !prev);
  const filteredAlerts = allAlerts.filter(a => filter === 'all' || a.type === filter);

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'info':
        return <Info size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'critical':
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className="alerts-container">
      <header className="alerts-header">
        <div>
          <h1>{t('system_alerts')}</h1>
          <p className="alerts-subtitle">{muted ? t('notifications_muted') : ''}</p>
        </div>
        <div className="alerts-controls">
          <button
            onClick={toggleMute}
            className={`mute-button ${muted ? 'muted' : ''}`}
            aria-label={muted ? t('unmute_notifications') : t('mute_notifications')}
          >
            {muted ? <BellOff size={20} /> : <Bell size={20} />}
          </button>
          <div className="filter-dropdown">
            <Filter size={18} className="filter-icon" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as AlertType | 'all')}
              className="filter-select"
            >
              <option value="all">{t('all_alerts')}</option>
              <option value="info">{t('info')}</option>
              <option value="warning">{t('warning')}</option>
              <option value="critical">{t('critical')}</option>
            </select>
          </div>
        </div>
      </header>

      <div className="alerts-content">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <p>{t('no_alerts_to_display', { filter: filter !== 'all' ? t(filter) : '' })}</p>
          </div>
        ) : (
          <ul className="alerts-list">
            {filteredAlerts.map(alert => (
              <li key={alert.id} className={`alert-item ${alert.type}`}>
                <div className="alert-icon-container">
                  <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                </div>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-footer">
                    <time className="alert-timestamp" dateTime={alert.timestamp}>
                      {new Date(alert.timestamp).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>
                    <div className="alert-type-badge">{alert.type}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Alerts;