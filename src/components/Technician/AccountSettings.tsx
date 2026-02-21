import React from 'react';
import {
  FiSun, FiMoon, FiMonitor, FiCheck, FiSave, FiGlobe
} from 'react-icons/fi';
import './AccountSettings.css';
import { useAppSettings } from '../../components/contexts/AppSettingsContext';
import type { Theme, Language } from '../../components/contexts/AppSettingsContext';

const AccountSettings = () => {
  const { theme, setTheme, language, setLanguage, t } = useAppSettings();

  // Languages available in the app
  const languages = [
    { id: 'en', label: `🇬🇧 ${t('english')}` },
    { id: 'am', label: `🇪🇹 ${t('amharic')}` },
    { id: 'ti', label: `🇹🇩 ${t('tigrinya')}` },
    { id: 'om', label: `🇴🇲 ${t('oromo')}` },
    { id: 'ar', label: `🇸🇦 ${t('arabic')}` },
    { id: 'zh', label: `🇨🇳 ${t('chinese')}` },
  ];

  // Theme options
  const themes = [
    { id: 'light', label: t('light_theme'), icon: <FiSun /> },
    { id: 'dark', label: t('dark_theme'), icon: <FiMoon /> },
    { id: 'default', label: t('default_theme'), icon: <FiMonitor /> },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="settings-container">
      <h1 className="settings-header">{t('account_settings')}</h1>

      {/* Preferences Section */}
      <div className="card">
        <h2 className="card-title"><FiGlobe /> {t('preferences')}</h2>
        <div className="prefs">
          <div className="pref-group">
            <label>{t('language')}</label>
            <select 
              value={language} 
              onChange={handleLanguageChange}
              className="language-select"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pref-group">
            <label>{t('theme')}</label>
            <div className="theme-options">
              {themes.map(th => (
                <button
                  key={th.id}
                  className={`theme-btn ${theme === th.id ? 'active' : ''}`}
                  onClick={() => setTheme(th.id as Theme)}
                  aria-label={th.label}
                >
                  {th.icon}
                  <span>{th.label}</span>
                  {theme === th.id && <FiCheck className="check-icon" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="save-btn">
          <FiSave /> {t('save_changes')}
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
