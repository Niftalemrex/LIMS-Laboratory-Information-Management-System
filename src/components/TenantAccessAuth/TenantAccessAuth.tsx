import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './TenantAccessAuth.css';
import axios from 'axios';
import { useAppSettings } from '../contexts/AppSettingsContext';
import type { Language } from '../contexts/AppSettingsContext';
import SupportChat from './SupportChat';
import { useTenantLogs } from '../contexts/TenantLogsContext';
import { useSystemLogs } from '../contexts/SystemLogsContext';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

// Background image – place your own lab image in assets
import labBackground from "../assets/aboutt.jpg";

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

// =================== CSRF Token ===================
const getCSRFToken = (): string => {
  const match = document.cookie.match(/csrftoken=([\w-]+)/);
  return match?.[1] ?? '';
};

// =================== Component ===================
const TenantAccessAuth: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useAppSettings();
  const { addLog } = useTenantLogs();
  const { addLog: addSystemLog } = useSystemLogs();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'superadmin' | 'tenant-admin' | 'doctor' | 'technician' | 'support' | 'patient'>('patient');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  // Tenant data
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [loading, setLoading] = useState(true);

  const API_CURRENT_TENANT = 'http://127.0.0.1:8000/api/tenant/current/';

  // Fetch current tenant (if any)
  const fetchCurrentTenant = async () => {
    try {
      const res = await fetch(API_CURRENT_TENANT, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch current tenant');
      const data: TenantData = await res.json();
      setTenant(data);
    } catch (err: any) {
      console.error(err);
      setErrors({ general: t('tenant_not_found') });
      setTimeout(() => setErrors({}), 3000);
    } finally {
      setLoadingTenant(false);
    }
  };

  useEffect(() => {
    fetchCurrentTenant();
    setLoading(false);
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('email_invalid');
    }
    
    if (!password.trim()) {
      newErrors.password = t('password_required');
    } else if (password.length < 6) {
      newErrors.password = t('password_min_length');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Demo login
  const handleDemoLogin = (demoRole: typeof role) => {
    const demoEmails = {
      superadmin: 'superadmin@demo.com',
      'tenant-admin': 'tenantadmin@demo.com',
      doctor: 'doctor@demo.com',
      technician: 'technician@demo.com',
      support: 'support@demo.com',
      patient: 'patient@demo.com',
    };
    setEmail(demoEmails[demoRole]);
    setPassword('demo123');
    setRole(demoRole);
    // Optionally auto-submit
    // handleAccess();
  };

  // Main login
  const handleAccess = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // Simulate API delay (remove in production)
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Demo accounts
      const DEMO_USERS: Record<typeof role, string> = {
        superadmin: 'superadmin@demo.com',
        'tenant-admin': 'tenantadmin@demo.com',
        doctor: 'doctor@demo.com',
        technician: 'technician@demo.com',
        support: 'support@demo.com',
        patient: 'patient@demo.com',
      };

      const isDemoLogin = password === 'demo123' && email === DEMO_USERS[role];

      if (isDemoLogin) {
        // Simulate successful demo login
        const user: User = {
          id: 'demo-' + role,
          email,
          role,
          tenant: role === 'tenant-admin' ? 'demo-tenant' : undefined,
          isPaid: true,
        };

        // Log
        addLog({
          user: user.email,
          action: `Demo login: ${user.email}`,
          status: 'Success',
          ipAddress: '127.0.0.1',
          details: `Role: ${user.role}, Tenant: ${user.tenant || 'N/A'}`,
        });
        addSystemLog({
          user: user.email,
          action: 'Demo login successful',
          status: 'Success',
          ipAddress: '127.0.0.1',
          details: `Role: ${user.role}, Tenant: ${user.tenant || 'N/A'}`,
        });

        // Navigate
        navigate(getDashboardPath(user.role, user.tenant));
        setIsLoading(false);
        return;
      }

      // Real login
      const res = await axios.post(
        '/api/login/',
        { email, password },
        { headers: { 'X-CSRFToken': getCSRFToken() } }
      );

      const user: User = res.data.user;
      if (!user) {
        throw new Error('Invalid credentials');
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

      // Logs
      addLog({
        user: user.email,
        action: `User logged in: ${user.email}`,
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: `Role: ${user.role}, Tenant: ${user.tenant || 'N/A'}`,
      });
      addSystemLog({
        user: user.email,
        action: 'User successfully logged in',
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: `Role: ${user.role}, Tenant: ${user.tenant || 'N/A'}`,
      });

      // Navigate
      navigate(getDashboardPath(user.role, user.tenant));
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || t('invalid_credentials');
      setErrors({ general: errorMsg });

      addLog({
        user: email,
        action: 'Failed login attempt',
        status: 'Error',
        ipAddress: '127.0.0.1',
        details: errorMsg,
      });
      addSystemLog({
        user: email,
        action: 'Failed login attempt',
        status: 'Error',
        ipAddress: '127.0.0.1',
        details: errorMsg,
      });

      setLoginAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardPath = (role: string, tenantId?: string) => {
    switch (role) {
      case 'superadmin': return '/SuperAdminDashboard';
      case 'tenant-admin': return tenantId ? `/TenantAdminDashboard?tenant=${tenantId}` : '/TenantAdminDashboard';
      case 'doctor': return '/DoctorDashboard';
      case 'technician': return '/TechnicianDashboard';
      case 'support': return '/SupportDashboard';
      default: return '/PatientDashboard';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAccess();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
  };

  if (loading || loadingTenant) return <div className="auth-container">{t('loading')}</div>;

  return (
    <div className="login-page-container" dir={rtlLanguages.includes(language) ? 'rtl' : 'ltr'}>
      {/* LEFT SIDE - Branding & Background Image */}
      <div className="left-side" style={{ backgroundImage: `url(${labBackground})` }}>
        <div className="left-side-overlay"></div>
        <div className="left-side-content">
          <div className="brand-header">
            <LIMSLogo />
            <h1 className="brand-name">Laboratory Information System</h1>
            <p className="brand-tagline">Multi‑tenant • Secure • Scalable</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔬</div>
              <h4>Multi‑Tenant Architecture</h4>
              <p>Isolated data, shared infrastructure</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h4>Role‑Based Dashboards</h4>
              <p>Tailored views for every user</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Enterprise Security</h4>
              <p>256‑bit encryption, audit logs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Real‑time Analytics</h4>
              <p>Monitor lab performance</p>
            </div>
          </div>

          <div className="app-downloads">
            <p>Get the mobile app</p>
            <div className="download-buttons">
              <a href="#" className="download-btn"><PlayStoreIcon /> Google Play</a>
              <a href="#" className="download-btn"><AppStoreIcon /> App Store</a>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="right-side">
        <div className="login-card-wrapper">
          <div className="login-card">
            {/* Welcome Header */}
            <div className="welcome-message">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to continue to LIMS</p>
            </div>

            {/* Demo Login Buttons */}
            <div className="demo-login-section">
              <p className="demo-label">Try demo accounts:</p>
              <div className="demo-buttons">
                <button className="demo-button superadmin" onClick={() => handleDemoLogin('superadmin')} disabled={isLoading}>
                  <Sparkles size={16} /> Superadmin
                </button>
                <button className="demo-button tenant-admin" onClick={() => handleDemoLogin('tenant-admin')} disabled={isLoading}>
                  <User size={16} /> Tenant Admin
                </button>
                <button className="demo-button doctor" onClick={() => handleDemoLogin('doctor')} disabled={isLoading}>
                  <User size={16} /> Doctor
                </button>
                <button className="demo-button technician" onClick={() => handleDemoLogin('technician')} disabled={isLoading}>
                  <User size={16} /> Technician
                </button>
                <button className="demo-button support" onClick={() => handleDemoLogin('support')} disabled={isLoading}>
                  <User size={16} /> Support
                </button>
                <button className="demo-button patient" onClick={() => handleDemoLogin('patient')} disabled={isLoading}>
                  <User size={16} /> Patient
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {errors.general && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <div className={`input-with-icon ${errors.email ? 'error' : email ? 'success' : ''}`}>
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                {email && !errors.email && <CheckCircle className="success-icon" size={18} />}
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className={`password-input-wrapper ${errors.password ? 'error' : password ? 'success' : ''}`}>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>
                <div className="password-actions">
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {password && !errors.password && <CheckCircle className="success-icon" size={18} />}
                </div>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Role Selector */}
            <div className="form-group">
              <div className="input-with-icon">
                <User className="input-icon" size={20} />
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  className="role-select"
                  disabled={isLoading}
                >
                  <option value="patient">🧬 Patient</option>
                  <option value="doctor">👨‍⚕️ Doctor</option>
                  <option value="technician">🔧 Technician</option>
                  <option value="support">📞 Support</option>
                  <option value="tenant-admin">🏢 Tenant Admin</option>
                  <option value="superadmin">👑 Superadmin</option>
                </select>
              </div>
            </div>

            {/* Remember me & Forgot */}
            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} disabled={isLoading} />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            </div>

            {/* Sign In Button */}
            <button className={`login-button ${isLoading ? 'loading' : ''}`} onClick={handleAccess} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="button-loader"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="arrow-icon" viewBox="0 0 24 24">
                    <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
                  </svg>
                </>
              )}
            </button>

            {/* Tenant Info */}
            {tenant && (
              <div className="tenant-info">
                <p>Currently accessing: <strong>{tenant.company_name}</strong></p>
              </div>
            )}

            {/* Create Tenant Link */}
            <div className="create-tenant-link">
              <p>Need a new tenant? <Link to="/superadmin/createTenant">Click here</Link></p>
            </div>

            {/* Language Selector */}
            <div className="language-selector">
              <select value={language} onChange={e => setLanguage(e.target.value as Language)}>
                <option value="en">🇬🇧 English</option>
                <option value="am">🇪🇹 Amharic</option>
                <option value="ti">🇪🇷 Tigrinya</option>
                <option value="om">🇪🇹 Oromo</option>
                <option value="ar">🇸🇦 Arabic</option>
                <option value="zh">🇨🇳 Chinese</option>
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