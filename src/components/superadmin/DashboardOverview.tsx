// src/pages/DashboardOverview.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiActivity, 
  FiAlertTriangle, 
  FiBarChart2, 
  FiPlus, 
  FiServer, 
  FiUsers, 
  FiChevronRight, 
  FiRefreshCw 
} from 'react-icons/fi';
import axios from 'axios';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useSystemLogs } from '../contexts/SystemLogsContext';
import './DashboardOverview.css';

interface Tenant {
  id: string;
  companyName: string;
  createdAt: string;
  billingPeriod: 'monthly' | 'yearly';
}

interface Metrics {
  activeHospitals: number;
  totalUsers: number;
  testsToday: number;
  systemAlerts: number;
  apiUsage: string;
}

interface SystemLog {
  id: string;
  user: string;
  action: string;
  status: 'Success' | 'Warning' | 'Critical' | 'Info';
  details: string;
  timestamp: string;
}

const DashboardOverview: React.FC = () => {
  const { t } = useAppSettings();
  const navigate = useNavigate();
  const { logs: contextLogs } = useSystemLogs();

  const [hospitals, setHospitals] = useState<Tenant[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    activeHospitals: 0,
    totalUsers: 0,
    testsToday: 0,
    systemAlerts: 0,
    apiUsage: '0'
  });
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ---------------- Fetch total users ----------------
  const fetchTotalUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/tenant/users/');
      return Array.isArray(res.data) ? res.data.length : 0;
    } catch (err) {
      console.error('Failed to fetch total users:', err);
      return 0;
    }
  };

  // ---------------- Fetch system logs ----------------
  const fetchSystemLogs = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/system/logs/');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('Failed to fetch system logs:', err);
      return [];
    }
  };

  // ---------------- Fetch hospitals and update metrics ----------------
  const fetchHospitalsAndMetrics = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/superadmin/tenants/');
      const tenants: Tenant[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.tenants)
          ? res.data.tenants
          : [];

      setHospitals(tenants);

      const totalUsers = await fetchTotalUsers();
      const logs = await fetchSystemLogs();

      setSystemLogs(logs);

      setMetrics({
        activeHospitals: tenants.length,
        totalUsers,
        testsToday: Math.floor(Math.random() * 200), // placeholder
        systemAlerts: logs.length,
        apiUsage: '8,950' // placeholder
      });

    } catch (err: any) {
      console.error(err);
      setApiError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitalsAndMetrics();
  }, [fetchHospitalsAndMetrics]);

  // ---------------- Navigation ----------------
  const handleAddNewTenant = () => navigate('/superadmin/createTenant');
  const handleViewAllHospitals = () => navigate('/superadmin/manageTenant');
  const handleViewAllSystemLogs = () => navigate('/superadmin/systemLog');

  return (
    <div className="dashboard-overview">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t('dashboard_overview')}</h1>
          <p className="dashboard-subtitle">{t('monitoring_stats')}</p>
        </div>
        <div className="dashboard-actions">
          <button className="refresh-button" onClick={fetchHospitalsAndMetrics}>
            <FiRefreshCw /> {t('refresh_data')}
          </button>
        </div>
      </div>

      {/* Loading & Error */}
      {apiError && <div className="error-message">{apiError}</div>}
      {loading && <p>{t('loading_data')}</p>}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card up">
          <div className="metric-icon-container"><FiActivity className="metric-icon" /></div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.activeHospitals}</h3>
            <p className="metric-label">{t('active_hospitals')}</p>
          </div>
        </div>
        <div className="metric-card up">
          <div className="metric-icon-container"><FiUsers className="metric-icon" /></div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.totalUsers}</h3>
            <p className="metric-label">{t('total_users')}</p>
          </div>
        </div>
        <div className="metric-card up">
          <div className="metric-icon-container"><FiBarChart2 className="metric-icon" /></div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.testsToday}</h3>
            <p className="metric-label">{t('tests_today')}</p>
          </div>
        </div>
        <div className="metric-card alert">
          <div className="metric-icon-container"><FiAlertTriangle className="metric-icon" /></div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.systemAlerts}</h3>
            <p className="metric-label">{t('system_alerts')}</p>
          </div>
        </div>
        <div className="metric-card warning">
          <div className="metric-icon-container"><FiServer className="metric-icon" /></div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.apiUsage}</h3>
            <p className="metric-label">{t('api_usage')}</p>
          </div>
        </div>
      </div>

      {/* Hospitals Table */}
      <div className="dashboard-content">
        <div className="content-section hospital-management">
          <div className="section-header">
            <h2 className="section-title">
              {t('hospital_management')}
              <span className="badge">{hospitals.length} {t('hospitals')}</span>
            </h2>
            <div className="section-actions">
              <button className="primary-button" onClick={handleAddNewTenant}>
                <FiPlus className="button-icon" /> {t('add_hospital')}
              </button>
              <button className="secondary-button" onClick={handleViewAllHospitals}>
                {t('view_all')} <FiChevronRight className="button-icon" />
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('hospital')}</th>
                  <th>{t('status')}</th>
                  <th>{t('created_at')}</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.length > 0 ? hospitals.map(h => (
                  <tr key={h.id}>
                    <td>{h.companyName}</td>
                    <td>{t('active')}</td>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3}>{t('no_hospitals_found')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs */}
        <div className="content-section system-logs">
          <div className="section-header">
            <h2 className="section-title">
              {t('system_logs')}
              <span className="badge">{systemLogs.length} {t('logs')}</span>
            </h2>
            <div className="section-actions">
              <button className="secondary-button" onClick={handleViewAllSystemLogs}>
                {t('view_all')} <FiChevronRight className="button-icon" />
              </button>
            </div>
          </div>
          <div className="logs-list">
            {systemLogs.length > 0 ? systemLogs.map(log => (
              <div key={log.id} className={`log-item ${log.status.toLowerCase()}`}>
                <div className="log-icon">
                  {log.status === 'Critical' && <FiAlertTriangle />}
                  {log.status === 'Warning' && <FiAlertTriangle />}
                  {log.status === 'Info' && <FiActivity />}
                  {log.status === 'Success' && <FiUsers />}
                </div>
                <div className="log-content">
                  <h4 className="log-title">{log.user}: {log.action}</h4>
                  <p className="log-details">{log.details}</p>
                  <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            )) : <p>{t('no_logs_found')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
