import React, { useState, useEffect } from 'react';
import { 
  FiDatabase, FiDownload, FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw,
  FiSettings, FiZap
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // ✅ react-router
import './BackupDatabase.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import type { Integration } from './IntegrationsSettings';

interface Tenant { id: string; companyName: string; email: string; }

interface BackupHistoryItem {
  id: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  size: string;
  type: 'manual' | 'automatic';
  integrations: string[];
}

const CATEGORY_KEY = 'integrationCategories';
const CONNECTED_KEY = 'integrationConnected';

const BackupDatabase: React.FC = () => {
  const { t } = useAppSettings();
  const navigate = useNavigate(); // ✅ hook for navigation

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([]);
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backupIntegrations, setBackupIntegrations] = useState<Integration[]>([]);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('');

  // Load tenants
  useEffect(() => {
    const storedTenantsStr = localStorage.getItem('tenantAdmins');
    if (storedTenantsStr) {
      const parsed: Tenant[] = JSON.parse(storedTenantsStr).map((t: any) => ({
        id: t.id,
        companyName: t.companyName,
        email: t.email
      }));
      setTenants(parsed);
      if (parsed.length > 0) setSelectedTenant;
    }
  }, []);

  // Load database integrations dynamically
  useEffect(() => {
    const categoriesStr = localStorage.getItem(CATEGORY_KEY);
    const connectedStr = localStorage.getItem(CONNECTED_KEY);

    if (categoriesStr && connectedStr) {
      const categories: Record<string, Integration['category']> = JSON.parse(categoriesStr);
      const connected: Record<string, boolean> = JSON.parse(connectedStr);

      const dbIntegrations: Integration[] = Object.keys(categories)
        .filter(id => categories[id] === 'database')
        .map(id => ({
          id,
          name: id === 'local_pc' ? t('local_download') :
                id === 'google_drive' ? t('google_drive') :
                id.replace(/_/g, ' ').toUpperCase(),
          category: 'database',
          connected: connected[id] ?? false,
        }));

      setBackupIntegrations(dbIntegrations);

      const firstConnected = dbIntegrations.find(i => i.connected);
      setSelectedIntegrationId(firstConnected?.id || '');
    }
  }, [t]);

  // Load backup history per tenant
  useEffect(() => {
    if (selectedTenant) {
      const historyStr = localStorage.getItem(`backupHistory_${selectedTenant.id}`);
      setBackupHistory(historyStr ? JSON.parse(historyStr) : []);
    }
  }, [selectedTenant]);

  const handleBackup = () => {
    if (!selectedIntegrationId) {
      alert(t('no_backup_destination_selected'));
      return;
    }

    const activeIntegrations = backupIntegrations
      .filter(i => i.id === selectedIntegrationId && i.connected)
      .map(i => i.name);

    if (!activeIntegrations.length) {
      alert(t('no_backup_destination_selected'));
      return;
    }

    setIsLoading(true);
    setBackupStatus(t('backup_in_progress'));

    // Simulate backup process (replace with real API call here)
    setTimeout(() => {
      const newBackup: BackupHistoryItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        status: 'success',
        size: `${(Math.random() * 2 + 1).toFixed(2)} GB`,
        type: 'manual',
        integrations: activeIntegrations
      };

      const updatedHistory = [newBackup, ...backupHistory];
      setBackupHistory(updatedHistory);

      if (selectedTenant) {
        localStorage.setItem(`backupHistory_${selectedTenant.id}`, JSON.stringify(updatedHistory));
      }

      setIsLoading(false);
      setBackupStatus(t('backup_success'));
    }, 3000);
  };

  const StatusIcon = ({ status }: { status: BackupHistoryItem['status'] }) => {
    switch (status) {
      case 'success': return <FiCheckCircle className="status-icon success" />;
      case 'failed': return <FiAlertCircle className="status-icon failed" />;
      case 'pending': return <FiClock className="status-icon pending" />;
      default: return null;
    }
  };

  const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString();

  return (
    <div className="backup-container">
      {/* Tenant selector */}
      {tenants.length > 0 && (
        <div className="tenant-selector">
          <label>{t('select_tenant')}:</label>
          <select value={selectedTenant?.id || ''} onChange={e => {
            const tenant = tenants.find(t => t.id === e.target.value) || null;
            setSelectedTenant(tenant);
          }}>
            <option value="">{t('select_tenant')}</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.companyName} ({t.email})</option>)}
          </select>
        </div>
      )}

      {/* Backup integration dropdown */}
      <div className="integration-dropdown">
        <label>{t('select_backup_integration')}:</label>
        <select
          value={selectedIntegrationId}
          onChange={e => setSelectedIntegrationId(e.target.value)}
        >
          <option value="">{t('select_integration')}</option>
          {backupIntegrations.map(i => (
            <option key={i.id} value={i.id} disabled={!i.connected}>
              {i.name} {i.connected ? `(${t('connected')})` : `(${t('not_connected')})`}
            </option>
          ))}
        </select>
      </div>

      {!selectedTenant ? (
        <div className="no-tenant-selected">
          <h2>{t('no_tenant_selected')}</h2>
          <p>{t('please_select_tenant_first')}</p>
        </div>
      ) : (
        <>
          <div className="backup-header">
            <div className="header-left"><FiDatabase /> <h2>{t('backup_title')} - {selectedTenant.companyName}</h2></div>
            <button
  className="settings-button"
  onClick={() => navigate('/superadmin/IntegrationsSettings')}
>
  <FiSettings /> {t('backup_settings')}
</button>

          </div>

          <div className="backup-content">
            {/* Backup card */}
            <div className="backup-card">
              <h3>{t('manual_backup')}</h3>
              <p>{t('backup_description')}</p>

              <div className="backup-stats">
                <div>{t('last_backup')}: {backupHistory[0] ? formatDateTime(backupHistory[0].date) : t('never')}</div>
                <div>{t('total_size')}: {backupHistory.reduce((sum, b) => sum + parseFloat(b.size), 0).toFixed(2)} GB</div>
              </div>

              <button onClick={handleBackup} disabled={isLoading}>
                {isLoading ? <><FiRefreshCw /> {t('processing')}</> : <><FiDownload /> {t('start_backup')}</>}
              </button>

              {backupStatus && (
                <div className={`status-message ${backupStatus === t('backup_success') ? 'success' : 'failed'}`}>
                  {backupStatus}
                </div>
              )}
            </div>

            {/* Integration cards */}
            <div className="backup-integrations">
              <h3><FiZap /> {t('backup_destinations')}</h3>
              <div className="integrations-grid">
                {backupIntegrations.map(i => (
                  <div key={i.id} className={`integration-card ${i.connected ? 'connected' : ''}`}>
                    <div>{i.name.charAt(0)}</div>
                    <div>{i.name} - {i.connected ? t('connected') : t('not_connected')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup history */}
            <div className="backup-history">
              <h3><FiClock /> {t('history')}</h3>
              {backupHistory.length ? backupHistory.map(item => (
                <div key={item.id} className="history-row">
                  <div>{formatDateTime(item.date)}</div>
                  <div>{item.type}</div>
                  <div>{item.size}</div>
                  <div><StatusIcon status={item.status} /> {t(`status_${item.status}`)}</div>
                  <div>{item.integrations.join(', ')}</div>
                </div>
              )) : <div>{t('no_history')}</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BackupDatabase;
