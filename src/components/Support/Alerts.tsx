import React, { useState, useEffect, useMemo } from 'react';
import { Info, AlertTriangle, AlertCircle, Bell, BellOff, Filter } from 'lucide-react';
import './Alerts.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import type { TenantLogEntry } from '../contexts/TenantLogsContext';
import { useTenantLogs } from '../contexts/TenantLogsContext';

type AlertType = 'info' | 'warning' | 'critical';

interface Alert extends TenantLogEntry {
  id: string;
  type: AlertType;
  message: string;
  status: string;
  timestamp: string;
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

  // Only add logs that aren't in persistedAlerts
  const newLogs = useMemo(() => {
    const persistedIds = new Set(persistedAlerts.map(a => a.id));
    return logs
      .filter(log => !persistedIds.has(log.id))
      .map(log => ({
        id: log.id,
        type:
          log.status.toLowerCase() === 'error'
            ? 'critical'
            : log.status.toLowerCase() === 'warning'
            ? 'warning'
            : 'info',
        message: log.message || log.action || 'No message',
        status: log.status || 'active',
        timestamp: log.timestamp || new Date().toISOString(),
      }));
  }, [logs, persistedAlerts]);

  // Combine persistedAlerts + newLogs for UI
  const alerts: Alert[] = useMemo(() => {
    const allAlerts = [...persistedAlerts, ...newLogs];
    // Sort descending by timestamp
    return allAlerts.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [persistedAlerts, newLogs]);

  // Sync new logs to backend
  useEffect(() => {
    const syncNewLogs = async () => {
      for (const log of newLogs) {
        try {
          const payload = { ...log };
          const res = await fetch('http://localhost:8000/api/alerts/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            setPersistedAlerts(prev => [...prev, payload]);
          } else {
            const errData = await res.json();
            console.error(`Failed to post alert ${log.id}:`, errData);
          }
        } catch (err) {
          console.error(`Error syncing alert ${log.id}:`, err);
        }
      }
    };

    if (newLogs.length > 0) syncNewLogs();
  }, [newLogs]);

  const toggleMute = () => setMuted(prev => !prev);
  const filteredAlerts = alerts.filter(a => filter === 'all' || a.type === filter);

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
