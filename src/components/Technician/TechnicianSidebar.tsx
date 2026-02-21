import React, { useState, useEffect } from 'react';
import { 
  FiGrid, FiDroplet, FiPackage, FiCalendar, FiLogOut,
  FiChevronDown, FiSettings, FiChevronRight, FiClipboard,
  FiBell, FiFileText, FiUserCheck
} from 'react-icons/fi';
import { MdScience } from 'react-icons/md';
import './TechnicianSidebar.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import type { Language } from '../contexts/AppSettingsContext';
import type { UserMenuProfile } from './TechnicianDashboard';

interface TechnicianSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userMenuProfile: UserMenuProfile;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TechnicianSidebar: React.FC<TechnicianSidebarProps> = ({
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
    { id: 'samples', label: t('sample_management'), icon: <FiDroplet /> },
    { id: 'tests', label: t('test_results'), icon: <MdScience /> },
    { id: 'equipment', label: t('equipment_management'), icon: <FiPackage /> },
    { id: 'inventory', label: t('inventory_management'), icon: <FiPackage /> },
    { id: 'reports', label: t('test_reports'), icon: <FiFileText /> },
    { id: 'scheduling', label: t('scheduling'), icon: <FiCalendar /> },
  ];

  const settingsMenuItems = [
    { id: 'preferences', label: t('preferences') },
    { id: 'notifications', label: t('notifications'), icon: <FiBell /> },
    { id: 'account', label: t('account_settings') },
    { id: 'security', label: t('security_settings') },
  ];

  const handleLogout = () => {
    console.log('Logging out...');
    onSectionChange('logout');
    setMobileOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      ></div>

      <aside className={`technician-sidebar ${mobileOpen ? 'open' : ''} ${isRTL ? 'rtl' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="profile-card">
            <div className="profile-avatar">
              <MdScience className="lab-icon" />
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{t('lab_technician')}</h2>
              <p className="profile-role">{t('laboratory_system')}</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {mainMenuItems.map(item => (
              <li
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => { onSectionChange(item.id); setMobileOpen(false); }}
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
            <div className="settings-header">
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
                  onClick={() => { onSectionChange(item.id); setMobileOpen(false); }}
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
            <div className="user-avatar">{userMenuProfile.name[0]}</div>
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
                onClick={() => { onSectionChange('profile'); setExpandedUserMenu(false); setMobileOpen(false); }}
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
    </>
  );
};

export default TechnicianSidebar;
