import React, { useState, useEffect } from 'react';
import {
  FiGrid, FiUsers, FiDatabase, FiActivity, FiTag, FiBarChart2,
  FiClipboard, FiPrinter, FiHome, FiBell, FiSettings,
  FiChevronDown, FiChevronRight, FiLogOut, FiUserCheck
} from 'react-icons/fi';
import { FaHospital } from 'react-icons/fa';
import './TenantAdminSidebar.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import type { Language } from '../contexts/AppSettingsContext';
import type { UserMenuProfile } from './TenantAdminDashboard';

interface TenantAdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userMenuProfile: UserMenuProfile;
  setUserMenuProfile: React.Dispatch<React.SetStateAction<UserMenuProfile>>;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const TenantAdminSidebar: React.FC<TenantAdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  userMenuProfile,
  setUserMenuProfile,
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
    { id: 'overview', label: t('dashboard'), icon: <FiGrid /> },
    { id: 'users', label: t('user_management'), icon: <FiUsers /> },
    { id: 'tests', label: t('manage_tests'), icon: <FiDatabase /> },
    { id: 'cultures', label: t('cultures_antibiotics'), icon: <FiActivity /> },
    { id: 'prices', label: t('tests_cultures_pricing'), icon: <FiTag /> },
    { id: 'inventory', label: t('inventory_management'), icon: <FiDatabase /> },
    { id: 'doctors', label: t('doctors_management'), icon: <FiUsers /> },
    { id: 'technicians', label: t('technicians_management'), icon: <FiUsers /> },
    { id: 'reports', label: t('test_reports'), icon: <FiClipboard /> },
    { id: 'analytics', label: t('analytics_dashboard'), icon: <FiBarChart2 /> },
    { id: 'receipts', label: t('receipts_printing'), icon: <FiPrinter /> },
    { id: 'home-visits', label: t('home_visit_requests'), icon: <FiHome /> },
    { id: 'home-schedule', label: t('home_visit_schedule'), icon: <FiClipboard /> },
    { id: 'branches', label: t('branches_management'), icon: <FiHome /> },
    { id: 'contracts', label: t('contracts_discounts'), icon: <FiClipboard /> },
    { id: 'accounting', label: t('accounting'), icon: <FiBarChart2 /> },
  ];

  const settingsMenuItems = [
    { id: 'account', label: t('account_settings') },
    { id: 'notifications', label: t('notifications'), icon: <FiBell /> },
    { id: 'security', label: t('security_settings') },
    { id: 'integrations', label: t('integrations') },
  ];

  const handleLogout = () => {
    console.log('Tenant admin logged out');
  };

  return (
    <aside className={`tenantadmin-sidebar ${mobileOpen ? 'open' : ''} ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="profile-card">
          <div className="profile-avatar">
            <FaHospital className="hospital-icon" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{t('tenant_admin')}</h2>
            <p className="profile-role">{t('tenant_administrator')}</p>
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

      {/* Settings Section */}
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

export default TenantAdminSidebar;
