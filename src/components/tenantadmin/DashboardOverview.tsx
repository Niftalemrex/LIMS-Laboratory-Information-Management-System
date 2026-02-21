// src/components/tenantadmin/DashboardOverview.tsx
import React, { useState, useEffect } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useTenantLogs } from '../contexts/TenantLogsContext';
import './DashboardOverview.css';

interface MetricItem {
  label: string;
  value: string | number;
  change: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

interface InsightItem {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch?: string;
  tenant: string;
}

interface TenantData {
  id: number;
  company_name: string;
  email: string;
  created_at: string;
}

const DashboardOverview: React.FC = () => {
  const { t } = useAppSettings();
  const { logs } = useTenantLogs();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);

  const API_USERS = 'http://127.0.0.1:8000/api/tenant/users/';
  const API_CURRENT_TENANT = 'http://127.0.0.1:8000/api/tenant/current/';

  // Fetch current tenant
  const fetchCurrentTenant = async () => {
    try {
      const res = await fetch(API_CURRENT_TENANT);
      if (!res.ok) throw new Error('Failed to fetch current tenant');
      const data: TenantData = await res.json();
      setTenant(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTenant(false);
    }
  };

  // Fetch users for current tenant
  const fetchUsers = async () => {
    if (!tenant) return;
    try {
      const res = await fetch(`${API_USERS}?tenant=${tenant.id}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: User[] = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCurrentTenant(); }, []);
  useEffect(() => { if (tenant) fetchUsers(); }, [tenant]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([fetchCurrentTenant(), fetchUsers()])
      .finally(() => setTimeout(() => setIsRefreshing(false), 800));
  };

  // Dynamic metrics
  const activeUsers = users.length;
  const activeAlerts = logs.filter(
    log => log.status === 'Error' || log.status === 'Warning'
  ).length;

  const metrics: MetricItem[] = [
    {
      label: t('active_users'),
      value: activeUsers,
      change: {
        value: activeUsers > 0 ? t('change_positive') : t('no_change'),
        type: activeUsers > 0 ? 'positive' : 'neutral',
      },
    },
    {
      label: t('system_alerts'),
      value: activeAlerts,
      change: {
        value: activeAlerts > 0 ? t('alert_increase') : t('no_change'),
        type: activeAlerts > 0 ? 'negative' : 'neutral',
      },
    },
    {
      label: t('system_uptime'),
      value: '99.99%',
      change: { value: t('stable'), type: 'positive' },
    },
    {
      label: t('pending_requests'),
      value: 0,
      change: { value: t('no_change'), type: 'neutral' },
    },
  ];

  const insights: InsightItem[] = [
    {
      id: '1',
      text:
        activeUsers > 0
          ? `${activeUsers} ${t('users_currently_active')}`
          : t('no_active_users'),
      priority: activeUsers > 0 ? 'medium' : 'low',
    },
    {
      id: '2',
      text:
        activeAlerts > 0
          ? `${activeAlerts} ${t('system_alerts_detected')}`
          : t('no_system_alerts'),
      priority: activeAlerts > 0 ? 'high' : 'low',
    },
  ];

  if (loadingTenant) {
    return (
      <section className="dashboard-overview card">
        <p>{t('loading_tenant')}</p>
      </section>
    );
  }

  return (
    <section
      className="dashboard-overview card"
      aria-labelledby="dashboard-title"
    >
      <header className="dashboard-header">
        <h2 id="dashboard-title">{t('dashboard_overview')}</h2>
        <button
          className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          aria-label={t('refresh_data')}
          disabled={isRefreshing}
        >
          <span className="refresh-icon" aria-hidden="true">
            ↻
          </span>
          {isRefreshing ? t('refreshing') : t('refresh')}
        </button>
      </header>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <article
            key={`metric-${index}`}
            className="metric"
            aria-labelledby={`metric-label-${index}`}
          >
            <p id={`metric-label-${index}`} className="metric-label">
              {metric.label}
            </p>
            <p className="metric-value">{metric.value}</p>
            <p className={`metric-change ${metric.change.type}`}>
              {metric.change.value}
            </p>
          </article>
        ))}
      </div>

      <section className="insights" aria-labelledby="insights-title">
        <h3 id="insights-title">{t('quick_insights')}</h3>
        <ul className="insights-list">
          {insights.map(insight => (
            <li
              key={insight.id}
              className={`insight-item ${insight.priority}`}
            >
              {insight.text}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
};

export default DashboardOverview;
