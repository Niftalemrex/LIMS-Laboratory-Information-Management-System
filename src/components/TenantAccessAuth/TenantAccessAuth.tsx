import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './TenantAccessAuth.css';
import axios from 'axios';
import { useAppSettings } from '../contexts/AppSettingsContext';
import type { Language } from '../contexts/AppSettingsContext';
import SupportChat from './SupportChat';
import { useTenantLogs } from '../contexts/TenantLogsContext';
import { useSystemLogs } from '../contexts/SystemLogsContext'; // ✅ Added SystemLogs

// =================== RTL Languages ===================
const rtlLanguages: Language[] = ['ar'];

// =================== Icons ===================
const AppStoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z"/>
  </svg>
);

const PlayStoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96 2.694-1.586Zm-3.595 2.17L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055l7.294-4.24ZM1 13.396V2.603L6.846 8 1 13.396ZM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27Z"/>
  </svg>
);

const SupportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
  </svg>
);

// =================== LIMS Logo ===================
const LIMSLogo = () => (
  <div className="lims-logo">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#4361ee"/>
      <path d="M12 12H28V28H12V12Z" fill="white" fillOpacity="0.1"/>
      <path d="M16 16V24H24V16H16Z" fill="white"/>
      <path d="M20 12V28" stroke="white" strokeWidth="2"/>
      <path d="M12 20H28" stroke="white" strokeWidth="2"/>
    </svg>
    <span>LIMS</span>
  </div>
);

// =================== Types ===================
type Message = { id: number; text: string; sender: 'user' | 'bot'; timestamp: Date; };

// ✅ Axios defaults
axios.defaults.baseURL = 'http://localhost:8000/';
axios.defaults.withCredentials = true;

interface User {
  id: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'tenant-admin' | 'doctor' | 'technician' | 'support' | 'patient';
  tenant?: string;
  isPaid?: boolean;
  created_by?: string;
}

interface TenantData {
  id: number;
  company_name: string;
  email: string;
  created_at: string;
}

const getCSRFToken = (): string => {
  const match = document.cookie.match(/csrftoken=([\w-]+)/);
  return match?.[1] ?? '';
};

const TenantAccessAuth: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useAppSettings();
  const { addLog } = useTenantLogs();
  const { addLog: addSystemLog } = useSystemLogs(); // ✅ SystemLogs hook

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [loading, setLoading] = useState(true);

  const API_CURRENT_TENANT = 'http://127.0.0.1:8000/api/tenant/current/';

  const fetchCurrentTenant = async () => {
    try {
      const res = await fetch(API_CURRENT_TENANT, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch current tenant');
      const data: TenantData = await res.json();
      setTenant(data);
    } catch (err: any) {
      console.error(err);
      setError(t('tenant_not_found'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingTenant(false);
    }
  };

  useEffect(() => {
    fetchCurrentTenant();
    setLoading(false);
  }, []);

  const handleAccess = async () => {
    setError('');
    if (!email || !password) {
      setError(t('email_password_required'));
      return;
    }

    try {
      const res = await axios.post(
        '/api/login/',
        { email, password },
        { headers: { 'X-CSRFToken': getCSRFToken() } }
      );

      const user: User = res.data.user;
      if (!user) {
        setError(t('invalid_credentials'));
        return;
      }

      if (user.tenant) {
        try {
          const tenantRes = await axios.get(API_CURRENT_TENANT, {
            headers: { 'X-CSRFToken': getCSRFToken() },
          });
          setTenant(tenantRes.data);
        } catch (err) {
          console.error('Failed to fetch tenant after login', err);
        }
      }

      // ✅ Tenant logs
      addLog({
        user: user.email,
        action: `User logged in: ${user.email}`,
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: `Role: ${user.role}, Tenant: ${user.tenant || 'N/A'}`,
      });

      // ✅ System logs
      addSystemLog({
        user: user.email,
        action: 'User successfully logged in',
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: `Role: ${user.role}, Tenant: ${user.tenant || 'N/A'}`,
      });

      // Route based on role
      switch (user.role) {
        case 'superadmin':
          navigate('/SuperAdminDashboard');
          break;
        case 'tenant-admin':
          if (!user.isPaid) navigate('/TenantPaymentPage', { state: { tenant: user.id } });
          else navigate('/TenantAdminDashboard', { state: { tenant: user.id } });
          break;
        case 'doctor':
          navigate('/DoctorDashboard', { state: { tenant: user.tenant } });
          break;
        case 'technician':
          navigate('/TechnicianDashboard', { state: { tenant: user.tenant } });
          break;
        case 'support':
          navigate('/SupportDashboard', { state: { tenant: user.tenant } });
          break;
        case 'patient':
          navigate('/PatientDashboard', { state: { tenant: user.tenant } });
          break;
        default:
          setError(t('unknown_user_role'));
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || t('invalid_credentials');
      setError(errorMsg);

      // ✅ Tenant logs
      addLog({
        user: email,
        action: 'Failed login attempt',
        status: 'Error',
        ipAddress: '127.0.0.1',
        details: errorMsg,
      });

      // ✅ System logs
      addSystemLog({
        user: email,
        action: 'Failed login attempt',
        status: 'Error',
        ipAddress: '127.0.0.1',
        details: errorMsg,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAccess();
  };

  if (loading || loadingTenant) return <div className="tenant-access-container">{t('loading')}</div>;

  return (
    <div className="auth-container" dir={rtlLanguages.includes(language) ? 'rtl' : 'ltr'}>
      {/* Left Side - Description */}
      <div className="auth-description">
        <div className="description-content">
          <div className="logo-container"><LIMSLogo /><h2>{t('multi_tenant_lab_management')}</h2></div>
          <div className="features-list">
            {/* Features */}
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z"/></svg>
              </div>
              <div className="feature-text"><h3>{t('multi_tenant_architecture')}</h3><p>{t('multi_tenant_description')}</p></div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z"/></svg>
              </div>
              <div className="feature-text"><h3>{t('role_based_dashboards')}</h3><p>{t('role_based_description')}</p></div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
              </div>
              <div className="feature-text"><h3>{t('enterprise_security')}</h3><p>{t('security_description')}</p></div>
            </div>
          </div>

          {/* Mobile App */}
          <div className="app-downloads">
            <h3>{t('get_mobile_app')}</h3>
            <div className="download-buttons">
              <a href="#" className="download-btn"><PlayStoreIcon /><span>{t('google_play')}</span></a>
              <a href="#" className="download-btn"><AppStoreIcon /><span>{t('app_store')}</span></a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-wrapper">
        <div className="auth-form-container">
          <div className="auth-form">
            <div className="form-header"><h2>{t('welcome_back')}</h2><p>{t('sign_in_prompt')}</p></div>
            <div className="form-group">
              <label htmlFor="email">{t('email_address')}</label>
              <input 
                id="email" 
                type="email" 
                placeholder={t('email_placeholder')} 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                onKeyPress={handleKeyPress} 
                autoComplete="email" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{t('password')}</label>
              <input 
                id="password" 
                type="password" 
                placeholder={t('password_placeholder')} 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                onKeyPress={handleKeyPress} 
                autoComplete="current-password" 
              />
            </div>
            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">{t('remember_me')}</label>
              </div>
              <a href="#forgot" className="forgot-password">{t('forgot_password')}</a>
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button onClick={handleAccess} className="signin-button">{t('sign_in')}</button>
            
            {tenant && (
              <div className="tenant-info">
                <p>Currently accessing: <strong>{tenant.company_name}</strong></p>
              </div>
            )}
            
            <div className="create-tenant-link">
              <p>Need to create a new tenant? <Link to="/superadmin/createTenant">Click here</Link></p>
            </div>
            
            <div className="language-selector">
              <select value={language} onChange={e=>setLanguage(e.target.value as Language)}>
                <option value="en">🇬🇧 {t('english')}</option>
                <option value="am">🇪🇹 {t('amharic')}</option>
                <option value="ti">🇪🇷 {t('tigrinya')}</option>
                <option value="om">🇪🇹 {t('oromo')}</option>
                <option value="ar">🇸🇦 {t('arabic')}</option>
                <option value="zh">🇨🇳 {t('chinese')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Support Chat */}
      <SupportChat />
    </div>
  );
};

export default TenantAccessAuth;
