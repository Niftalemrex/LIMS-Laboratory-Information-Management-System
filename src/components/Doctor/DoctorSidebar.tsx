import React, { useState, useMemo, useEffect } from 'react';
import {
  FiGrid,
  FiFileText,
  FiPlusCircle,
  FiCalendar,
  FiActivity,
  FiLogOut,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiUserCheck,
} from 'react-icons/fi';
import { FaUserMd } from 'react-icons/fa';
import './DoctorSidebar.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import type { Language } from '../contexts/AppSettingsContext';
import type { UserMenuProfile } from './DoctorDashboard';

interface DoctorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userMenuProfile?: UserMenuProfile;
  setUserMenuProfile?: React.Dispatch<React.SetStateAction<UserMenuProfile>>;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const DoctorSidebar: React.FC<DoctorSidebarProps> = ({
  activeSection,
  onSectionChange,
  userMenuProfile,
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { t, language } = useAppSettings();
  const [expandedSettings, setExpandedSettings] = useState(false);
  const [expandedUserMenu, setExpandedUserMenu] = useState(false);

  const profile = userMenuProfile || {
    name: t('dr_smith'),
    email: 'dr.smith@medical.com',
    avatar: '',
  };

  // RTL support
  const rtlLanguages: Language[] = ['ar'];
  const isRTL = rtlLanguages.includes(language);

  useEffect(() => {
    document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  const mainMenuItems = useMemo(
    () => [
      { id: 'dashboard', label: t('dashboard'), icon: <FiGrid /> },
      { id: 'newRequest', label: t('new_test_request'), icon: <FiPlusCircle /> },
      { id: 'testResults', label: t('test_results'), icon: <FiFileText /> },
      { id: 'appointments', label: t('appointments'), icon: <FiCalendar /> },
      { id: 'quickActions', label: t('quick_actions'), icon: <FiActivity /> },
    ],
    [t]
  );

  const settingsMenuItems = useMemo(
    () => [
      { id: 'preferences', label: t('preferences') },
      { id: 'notifications', label: t('notifications') },
      { id: 'account', label: t('account_settings') },
    ],
    [t]
  );

  const handleLogout = () => {
    onSectionChange('logout');
    setMobileOpen?.(false);
  };

  const handleCloseMobile = () => {
    setMobileOpen?.(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && <div className="sidebar-overlay" onClick={handleCloseMobile}></div>}

      <aside
        className={`doctor-sidebar ${isRTL ? 'rtl' : ''} ${mobileOpen ? 'open' : ''}`}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="profile-card">
            <div className="profile-avatar">
              <FaUserMd className="doctor-icon" />
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{t('doctor_portal')}</h2>
              <p className="profile-role">{t('medical_dashboard')}</p>
            </div>
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
                  handleCloseMobile();
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
            className={`settings-toggle ${expandedSettings ? 'expanded' : ''}`}
            onClick={() => setExpandedSettings(!expandedSettings)}
          >
            <FiSettings className="settings-icon" />
            <span className="settings-label">{t('settings')}</span>
            <FiChevronDown
              className={`dropdown-icon ${expandedSettings ? 'expanded' : ''}`}
            />
          </div>

          {expandedSettings && (
            <ul className="settings-submenu">
              {settingsMenuItems.map((item) => (
                <li
                  key={item.id}
                  className={`submenu-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onSectionChange(item.id);
                    handleCloseMobile();
                  }}
                >
                  <FiChevronRight className="arrow-icon" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom User Menu */}
        <div className="user-menu-section">
          <div
            className="user-menu-toggle"
            onClick={() => setExpandedUserMenu(!expandedUserMenu)}
          >
            <div className="user-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="avatar-img" />
              ) : (
                <FaUserMd className="doctor-icon" />
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{profile.name}</span>
              <span className="user-email">{profile.email}</span>
            </div>
            <FiChevronDown
              className={`dropdown-icon ${expandedUserMenu ? 'expanded' : ''}`}
            />
          </div>

          {expandedUserMenu && (
            <div className="user-dropdown-menu">
              <button
                className="profile-button"
                onClick={() => {
                  onSectionChange('profile');
                  setExpandedUserMenu(false);
                  handleCloseMobile();
                }}
              >
                <FiUserCheck className="profile-icon" />
                <span>{t('profile')}</span>
              </button>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
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

export default DoctorSidebar;
