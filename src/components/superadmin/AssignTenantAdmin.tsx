import React, { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { 
  FiUserPlus, 
  FiChevronDown, 
  FiCheck, 
  FiX,
  FiMail,
  FiBriefcase
} from 'react-icons/fi';
import './AssignTenantAdmin.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useSystemLogs } from '../contexts/SystemLogsContext';
import axios from 'axios';

interface Tenant {
  id: string;
  name: string;
}

interface Props {
  onAssign?: (tenantId: string, email: string) => Promise<void> | void;
  isLoading?: boolean;
}

const AssignTenantAdmin: React.FC<Props> = ({ onAssign, isLoading = false }) => {
  const { t } = useAppSettings();
  const { addLog } = useSystemLogs();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loadingTenants, setLoadingTenants] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axios.get('/api/superadmin/tenants/');
        setTenants(res.data.map((tenant: any) => ({ id: tenant.id, name: tenant.company_name })));
      } catch (err) {
        console.error('Failed to fetch tenants', err);
        setNotification({ type: 'error', message: t('failed_load_tenants') });
      } finally {
        setLoadingTenants(false);
      }
    };
    fetchTenants();
  }, [t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedTenant || !adminEmail) {
      setNotification({ type: 'error', message: t('select_tenant_and_email') });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      setNotification({ type: 'error', message: t('enter_valid_email') });
      return;
    }

    try {
      if (onAssign) await onAssign(selectedTenant, adminEmail);
      else await axios.post('/api/superadmin/assign-admin/', { tenantId: selectedTenant, email: adminEmail });

      setNotification({ type: 'success', message: t('admin_assigned_success') });

      await addLog({
        user: adminEmail,
        action: `Assigned as tenant admin for tenant: ${selectedTenant}`,
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: `Tenant ID: ${selectedTenant}`
      });

      setSelectedTenant('');
      setAdminEmail('');
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      console.error(error);
      setNotification({ type: 'error', message: t('admin_assign_failed') });

      await addLog({
        user: adminEmail,
        action: `Failed to assign tenant admin for tenant: ${selectedTenant}`,
        status: 'Error',
        ipAddress: '127.0.0.1',
        details: error?.message || 'Unknown error'
      });
    }
  };

  const getSelectedTenantName = () => tenants.find(t => t.id === selectedTenant)?.name || t('select_tenant');

  return (
    <div className="assign-admin-container">
      <header className="assign-admin-header">
        <h2><FiUserPlus className="header-icon" />{t('assign_tenant_admin')}</h2>
        <p className="subtitle">{t('assign_admin_subtitle')}</p>
      </header>

      <form className="assign-admin-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-control">
            <label htmlFor="tenant"><FiBriefcase className="input-icon" />{t('tenant')}</label>
            <div className="dropdown-container">
              <button
                type="button"
                className={`dropdown-toggle ${selectedTenant ? 'has-value' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={loadingTenants}
              >
                {loadingTenants ? t('loading') : getSelectedTenantName()}
                <FiChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {tenants.length ? tenants.map(t => (
                    <div
                      key={t.id}
                      className={`dropdown-item ${selectedTenant === t.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedTenant(t.id); setIsDropdownOpen(false); }}
                    >
                      {t.name} {selectedTenant === t.id && <FiCheck className="check-icon" />}
                    </div>
                  )) : <div className="dropdown-item empty">{t('no_tenants_found')}</div>}
                </div>
              )}
            </div>
          </div>

          <div className="form-control">
            <label htmlFor="email"><FiMail className="input-icon" />{t('admin_email')}</label>
            <input
              type="email"
              id="email"
              placeholder={t('admin_email_placeholder')}
              value={adminEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAdminEmail(e.target.value)}
            />
          </div>
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === 'success' ? <FiCheck className="notification-icon" /> : <FiX className="notification-icon" />}
            <span>{notification.message}</span>
          </div>
        )}

        <div className="form-footer">
          <button type="submit" className="btn primary" disabled={isLoading}>
            {isLoading ? t('assigning') : t('assign_admin')}
          </button>
          <button
            type="button"
            className="btn outline"
            onClick={() => { setSelectedTenant(''); setAdminEmail(''); setNotification(null); }}
            disabled={isLoading}
          >
            {t('clear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTenantAdmin;
