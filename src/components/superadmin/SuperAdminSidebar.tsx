import React, { useState, useEffect } from 'react';
import {
  FiGrid, FiUsers, FiEdit3, FiBarChart2,
  FiUserCheck, FiClipboard, FiLogOut, FiSettings,
  FiChevronDown, FiChevronRight, FiGlobe, FiDatabase
} from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';
import './SuperAdminSidebar.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import type { Language } from '../contexts/AppSettingsContext';
import type { UserMenuProfile } from './SuperAdminDashboard';

interface SuperAdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userMenuProfile: UserMenuProfile;
  setUserMenuProfile: React.Dispatch<React.SetStateAction<UserMenuProfile>>;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  userMenuProfile,
  mobileOpen,
  setMobileOpen,
}) => {
  const { t, language } = useAppSettings();
  const [expandedSettings, setExpandedSettings] = useState(false);
  const [expandedUserMenu, setExpandedUserMenu] = useState(false);

  const rtlLanguages: Language[] = ['ar'];
  const isRTL = rtlLanguages.includes(language);

  useEffect(() => {
    document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  const mainMenuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: <FiGrid /> },
    { id: 'tenants', label: t('manage_tenants'), icon: <FiUsers /> },
    { id: 'create', label: t('create_tenant'), icon: <FiEdit3 /> },
    { id: 'usage', label: t('usage_analytics'), icon: <FiBarChart2 /> },
    { id: 'assign', label: t('admin_management'), icon: <FiUserCheck /> },
    { id: 'logs', label: t('system_logs'), icon: <FiClipboard /> },
    { id: 'global-notifications', label: t('global_notifications'), icon: <FiGlobe /> },
    { id: 'monitoring', label: t('monitor_online_users'), icon: <FiUsers /> },
    { id: 'backup', label: t('backup_database'), icon: <FiDatabase /> },
  ];

  const settingsMenuItems = [
    { id: 'account-settings', label: t('account_settings') },
  //  { id: 'security', label: t('security') },
    { id: 'integrations', label: t('integrations') },
  ];

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <aside className={`superadmin-sidebar ${mobileOpen ? 'open' : ''} ${isRTL ? 'rtl' : ''}`}>

      {/* Header */}
      <div className="sidebar-header">
        <div className="profile-card">
          <div className="profile-avatar">
            <FaShieldAlt className="shield-icon" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{t('super_admin')}</h2>
            <p className="profile-role">{t('global_administrator')}</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {mainMenuItems.map(item => (
            <li
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                onSectionChange(item.id);
                if (setMobileOpen) setMobileOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings */}
      <div className="settings-section">
        <div
          className={`settings-toggle ${expandedSettings ? 'expanded' : ''}`}
          onClick={() => setExpandedSettings(!expandedSettings)}
        >
          <div className="settings--header">
            <FiSettings className="settings-icon" />
            <span className="settings-label">{t('settings')}</span>
            <FiChevronDown className={`dropdown-icon ${expandedSettings ? 'expanded' : ''}`} />
          </div>
        </div>
        {expandedSettings && (
          <ul className="settings-submenu">
            {settingsMenuItems.map(item => (
              <li
                key={item.id}
                className={`submenu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  onSectionChange(item.id);
                  if (setMobileOpen) setMobileOpen(false);
                }}
              >
                <FiChevronRight className="arrow-icon" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User Menu */}
      <div className="user-menu-section">
        <div
          className="user-menu-toggle"
          onClick={() => setExpandedUserMenu(!expandedUserMenu)}
        >
          <div className="user-avatar">
            <img src={userMenuProfile.avatar || '/api/placeholder/100/100'} alt={userMenuProfile.name} />
          </div>
          <div className="user-info">
            <span className="user-name">{userMenuProfile.name}</span>
            <span className="user-email">{userMenuProfile.email}</span>
          </div>
          <FiChevronDown className={`dropdown-icon ${expandedUserMenu ? 'expanded' : ''}`} />
        </div>

        {expandedUserMenu && (
          <div className="user-dropdown-menu">
            <button
              className="profile-button"
              onClick={() => {
                onSectionChange('profile');
                if (setMobileOpen) setMobileOpen(false);
                setExpandedUserMenu(false);
              }}
            >
              <FiUserCheck className="profile-icon" />
              <span>{t('Profile')}</span>
            </button>
            <button className="logout-button" onClick={handleLogout}>
              <FiLogOut className="logout-icon" />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
