import React, { useState, useEffect } from 'react';
import {
  FiGrid, FiPackage, FiAlertTriangle, FiRefreshCcw, FiLogOut,
  FiSettings, FiChevronDown, FiLifeBuoy, FiUsers, FiMessageSquare,
  FiUserCheck, FiChevronRight
} from 'react-icons/fi';
import './SupportSidebar.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

export interface UserMenuProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface SupportSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userMenuProfile: UserMenuProfile;
  setUserMenuProfile: React.Dispatch<React.SetStateAction<UserMenuProfile>>;
  mobileOpen?: boolean; // <-- added for mobile toggle
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SupportSidebar: React.FC<SupportSidebarProps> = ({
  activeSection,
  onSectionChange,
  userMenuProfile,
  mobileOpen = false,
  setMobileOpen
}) => {
  const { t, language } = useAppSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const profile = userMenuProfile || {
    name: t('support_agent'),
    email: t('level_2_support'),
    avatar: ''
  };

  const rtlLanguages = ['ar', 'he', 'fa'];
  const isRTL = rtlLanguages.includes(language);

  useEffect(() => {
    document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  const mainMenuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: <FiGrid /> },
    { id: 'tickets', label: t('support_tickets'), icon: <FiLifeBuoy /> },
    { id: 'inventory', label: t('inventory'), icon: <FiPackage /> },
    { id: 'alerts', label: t('system_alerts'), icon: <FiAlertTriangle /> },
    { id: 'reorders', label: t('reorders'), icon: <FiRefreshCcw /> },
    { id: 'team', label: t('team_management'), icon: <FiUsers /> },
    { id: 'messages', label: t('messages'), icon: <FiMessageSquare /> },
  ];

  const settingsMenuItems = [
    { id: 'accountSettings', label: t('account_settings') },
    { id: 'securitySettings', label: t('security_settings') },
    { id: 'notificationSettings', label: t('notifications') },
  ];

  const handleLogout = () => {
    onSectionChange('logout');
    setMobileOpen?.(false);
  };

  return (
    <aside className={`support-sidebar ${isRTL ? 'rtl' : ''} ${mobileOpen ? 'open' : ''}`}>
      
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand-container">
          <h1 className="sidebar-title">{t('support_portal')}</h1>
          <p className="sidebar-subtitle">{t('technical_support')}</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {mainMenuItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                onSectionChange(item.id);
                setMobileOpen?.(false); // close sidebar on mobile
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings Section */}
      <div className="settings-section">
        <div
          className={`settings-toggle ${showSettings ? 'expanded' : ''}`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <FiSettings className="settings-icon" />
          <span className="settings-label">{t('settings')}</span>
          <FiChevronDown className={`dropdown-icon ${showSettings ? 'expanded' : ''}`} />
        </div>

        {showSettings && (
          <ul className="settings-submenu">
            {settingsMenuItems.map((item) => (
              <li
                key={item.id}
                className={`submenu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  onSectionChange(item.id);
                  setShowSettings(false);
                  setMobileOpen?.(false); // close sidebar on mobile
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
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="user-avatar">
            <img
              src={profile.avatar || '/api/placeholder/100/100'}
              alt={profile.name}
              className="avatar-img"
            />
          </div>
          <div className="user-info">
            <span className="user-name">{profile.name}</span>
            <span className="user-role">{profile.email}</span>
          </div>
          <FiChevronDown className={`dropdown-icon ${showUserMenu ? 'expanded' : ''}`} />
        </div>

        {showUserMenu && (
          <div className="user-dropdown-menu">
            <button
              className="profile-button"
              onClick={() => {
                onSectionChange('profile');
                setShowUserMenu(false);
                setMobileOpen?.(false);
              }}
            >
              <FiUserCheck className="profile-icon" />
              <span>{t('profile')}</span>
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

export default SupportSidebar;
