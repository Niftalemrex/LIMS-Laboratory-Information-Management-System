import React, { useState } from 'react';
import {
  FiLock,
  FiShield,
  FiKey,
  FiRefreshCw,
  FiSave
} from 'react-icons/fi';
import './SecuritySettings.css';
import { useAppSettings } from '../contexts/AppSettingsContext'; // Adjust import path as needed

const SecuritySettings: React.FC = () => {
  const { t } = useAppSettings();
  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    passwordExpiry: 90,
    loginAlerts: true
  });

  return (
    <div className="security-settings">
      <h2 className="section-title">
        <FiShield className="icon" />
        {t('security_settings')}
      </h2>

      <div className="security-cards">
        {/* Two-Factor Auth */}
        <div className="security-item">
          <div className="security-icon">
            <FiLock />
          </div>
          <div className="security-content">
            <h3>{t('two_factor_auth')}</h3>
            <p>{t('two_factor_auth_desc')}</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={security.twoFactorAuth}
              onChange={() =>
                setSecurity(prev => ({
                  ...prev,
                  twoFactorAuth: !prev.twoFactorAuth
                }))
              }
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Password Rotation */}
        <div className="security-item">
          <div className="security-icon">
            <FiRefreshCw />
          </div>
          <div className="security-content">
            <h3>{t('password_rotation')}</h3>
            <p>{t('password_rotation_desc', )}</p>
            <input
              type="range"
              min="30"
              max="365"
              value={security.passwordExpiry}
              onChange={e =>
                setSecurity(prev => ({
                  ...prev,
                  passwordExpiry: parseInt(e.target.value)
                }))
              }
              className="range-slider"
            />
          </div>
        </div>

        {/* Login Alerts */}
        <div className="security-item">
          <div className="security-icon">
            <FiKey />
          </div>
          <div className="security-content">
            <h3>{t('login_alerts')}</h3>
            <p>{t('login_alerts_desc')}</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={security.loginAlerts}
              onChange={() =>
                setSecurity(prev => ({
                  ...prev,
                  loginAlerts: !prev.loginAlerts
                }))
              }
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <button className="save-btn">
        <FiSave /> {t('save_security_settings')}
      </button>
    </div>
  );
};

export default SecuritySettings;