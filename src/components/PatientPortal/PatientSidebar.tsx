import React, { useState, useEffect } from 'react';
import {
  FiHome,
  FiFileText,
  FiCalendar,
  FiUser,
  FiLogOut,
  FiMessageSquare,
  FiChevronDown,
  FiSettings,
  FiPlusCircle,
  FiHelpCircle
} from 'react-icons/fi';
import './PatientSidebar.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface PatientSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  patientName?: string;
  patientAvatar?: string;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const rtlLanguages = ['ar', 'he', 'fa']; // Arabic, Hebrew, Persian

const PatientSidebar: React.FC<PatientSidebarProps> = ({
  activeSection,
  onSectionChange,
  patientName = 'Patient Name',
  patientAvatar,
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { t, language } = useAppSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  // RTL support
  const isRTL = rtlLanguages.includes(language);
  useEffect(() => {
    document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  const mainMenuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: <FiHome size={18} /> },
    { id: 'test-results', label: t('test_results'), icon: <FiFileText size={18} /> },
    { id: 'appointments', label: t('appointments'), icon: <FiCalendar size={18} /> },
    { id: 'new-appointment', label: t('new_appointment'), icon: <FiPlusCircle size={18} /> },
    { id: 'messages', label: t('messages'), icon: <FiMessageSquare size={18} /> },
  ];

  const helpMenuItems = [
    { id: 'faq', label: t('faq') },
    { id: 'support', label: t('contact_support') },
    { id: 'guides', label: t('patient_guides') }
  ];

  const handleCloseMobile = () => {
    setMobileOpen?.(false);
  };

  const handleLogout = () => {
    onSectionChange('logout');
    setMobileOpen?.(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && <div className="sidebar-overlay" onClick={handleCloseMobile}></div>}

      <aside className={`patient-sidebar ${isRTL ? 'rtl' : ''} ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-container">
            <h1 className="sidebar-title">{t('patient_portal')}</h1>
            <p className="sidebar-subtitle">{t('healthcare_management')}</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {mainMenuItems.map(item => (
              <li
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => { onSectionChange(item.id); handleCloseMobile(); }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        {/* Help Section */}
        <div className="help-section">
          <div
            className={`help-toggle ${showHelpMenu ? 'expanded' : ''}`}
            onClick={() => setShowHelpMenu(!showHelpMenu)}
          >
            <FiHelpCircle className="help-icon" />
            <span className="help-label">{t('help_center')}</span>
            <FiChevronDown className={`dropdown-icon ${showHelpMenu ? 'expanded' : ''}`} />
          </div>

          {showHelpMenu && (
            <ul className="help-submenu">
              {helpMenuItems.map(item => (
                <li
                  key={item.id}
                  className={`submenu-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => { onSectionChange(item.id); handleCloseMobile(); }}
                >
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="user-menu-section">
          <div
            className="user-menu-toggle"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {patientAvatar ? <img src={patientAvatar} alt="Patient" /> : <FiUser />}
            </div>
            <div className="user-info">
              <span className="user-name">{patientName}</span>
              <span className="user-role">{t('patient')}</span>
            </div>
            <FiChevronDown className={`dropdown-icon ${showUserMenu ? 'expanded' : ''}`} />
          </div>

          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => { onSectionChange('profile'); handleCloseMobile(); }}
              >
                <FiUser className="dropdown-icon" />
                <span>{t('my_profile')}</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => { onSectionChange('settings'); handleCloseMobile(); }}
              >
                <FiSettings className="dropdown-icon" />
                <span>{t('settings')}</span>
              </div>
              <div className="dropdown-divider"></div>
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

export default PatientSidebar;
