// src/components/superadmin/TenantUsage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiAlertTriangle, 
  FiTrendingUp, 
  FiUsers, 
  FiDatabase, 
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import './TenantUsage.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface Tenant {
  id: string;
  companyName: string;
  createdAt: string;
  apiCalls?: number;
  samplesThisMonth?: number;
  testsThisMonth?: number;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

interface Alert {
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  tenant: string;
  role: string;
  branch?: string;
}

const TenantUsage: React.FC = () => {
  const { t } = useAppSettings();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ---------------- Fetch tenants ----------------
  const fetchTenants = async (): Promise<Tenant[]> => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/superadmin/tenants/');
      return Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.tenants)
          ? res.data.tenants
          : [];
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      return [];
    }
  };

  // ---------------- Fetch users ----------------
  const fetchUsers = async (): Promise<User[]> => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/tenant/users/');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('Failed to fetch users:', err);
      return [];
    }
  };

  // ---------------- Fetch alerts (from user logs) ----------------
  const fetchAlerts = async (): Promise<Alert[]> => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/system/logs/');
      const logs = Array.isArray(res.data) ? res.data : [];
      return logs.slice(0, 5).map((log: any) => ({
        type: log.user,
        message: `${log.action} - ${log.details}`,
        severity: log.status === 'Critical' ? 'high' : log.status === 'Warning' ? 'medium' : 'low',
        timestamp: new Date(log.timestamp).toLocaleString()
      }));
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      return [];
    }
  };

  // ---------------- Load all data ----------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [tenantsData, usersData, alertsData] = await Promise.all([
        fetchTenants(),
        fetchUsers(),
        fetchAlerts()
      ]);

      setTenants(tenantsData);
      setUsers(usersData);
      setAlerts(alertsData);

    } catch (err: any) {
      console.error(err);
      setApiError('Failed to load tenant usage data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- Stats ----------------
  const totalActiveUsers = users.length;
  const totalTenants = tenants.length;
  const activeTenants = tenants.length; // count all tenants (no isPaid filter)

  const totalApiCalls = tenants.reduce((sum, t) => sum + (t.apiCalls || 0), 0);
  const totalSamples = tenants.reduce((sum, t) => sum + (t.samplesThisMonth || 0), 0);
  const totalTests = tenants.reduce((sum, t) => sum + (t.testsThisMonth || 0), 0);

  const statsCards: StatCard[] = [
    { label: t('active_tenants'), value: activeTenants, icon: <FiUsers size={20} />, trend: 'up', change: '2.5%' },
    { label: t('api_calls'), value: totalApiCalls, icon: <FiActivity size={20} />, trend: 'up', change: '12.3%' },
    { label: t('samples_this_month'), value: totalSamples, icon: <FiDatabase size={20} />, trend: 'neutral' },
    { label: t('active_users'), value: totalActiveUsers, icon: <FiUsers size={20} />, trend: 'up', change: '5.8%' },
    { label: t('tests_this_month'), value: totalTests, icon: <FiTrendingUp size={20} />, trend: 'down', change: '3.2%' },
  ];

  const getAlertColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-50 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch(severity) {
      case 'high': return <FiAlertTriangle className="text-red-500" />;
      case 'medium': return <FiAlertTriangle className="text-yellow-500" />;
      case 'low': return <FiAlertTriangle className="text-blue-500" />;
      default: return <FiAlertTriangle className="text-gray-500" />;
    }
  };

  // ---------------- Weekly usage (mocked from tenants apiCalls) ----------------
  const weeklyUsage = tenants.slice(0, 7).map((tenant, idx) => ({
    day: t(['mon','tue','wed','thu','fri','sat','sun'][idx]),
    usage: tenant.apiCalls || 0,
    trend: Math.random() > 0.5 ? 'up' : 'down'
  }));

  return (
    <div className="tenant-usage-container">
      <header className="usage-header">
        <div>
          <h1>{t('tenant_usage_dashboard')}</h1>
          <p className="subtitle">{t('usage_dashboard_subtitle')}</p>
        </div>
        <div className="refresh-control">
          <button className="refresh-button" onClick={loadData} disabled={loading}>
            <FiRefreshCw size={16} />
            <span>{t('refresh_data')}</span>
          </button>
          <span className="last-updated">{t('updated_just_now')}</span>
        </div>
      </header>

      {apiError && <div className="error-message">{apiError}</div>}
      {loading && <p>{t('loading_data')}</p>}

      {/* Stats Grid */}
      <section className="stats-grid">
        {statsCards.map(item => (
          <div className="stat-card" key={item.label}>
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-content">
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </div>
            {item.trend && item.trend !== 'neutral' && (
              <div className={`stat-trend ${item.trend}`}>
                {item.trend === 'up' ? '↑' : '↓'} {item.change}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Data Visualization Section */}
      <section className="data-visualization">
        <div className="usage-chart">
          <div className="chart-header">
            <h2>{t('weekly_api_usage')}</h2>
          </div>
          <div className="bar-chart-container">
            <div className="bar-chart">
              {weeklyUsage.map(({ day, usage, trend }) => (
                <div className="bar-group" key={day}>
                  <div className="bar-wrapper">
                    <div className={`bar current ${trend}`} style={{ height: `${usage * 2}px` }} />
                  </div>
                  <span className="bar-label">{day}</span>
                </div>
              ))}
            </div>
            <div className="y-axis">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="alerts-panel">
          <div className="panel-header">
            <h2>{t('quota_alerts')}</h2>
            <span className="badge">{alerts.length} {t('active')}</span>
          </div>
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map((alert, idx) => (
                <div key={idx} className={`alert-item ${getAlertColor(alert.severity)}`}>
                  <div className="alert-icon">{getAlertIcon(alert.severity)}</div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <strong>{alert.type}</strong>
                      <span className="alert-time">{alert.timestamp}</span>
                    </div>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-alerts">
                <p>{t('no_active_alerts')}</p>
                <small>{t('all_tenants_within_limits')}</small>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TenantUsage;
