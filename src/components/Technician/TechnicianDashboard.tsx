import React, { useState } from 'react';
import TechnicianSidebar from './TechnicianSidebar';
import DashboardOverview from './DashboardOverview';
import Samples from './Samples';
import TestResults from './TestResults';
import TestReports from './TestReports';
import Equipment from './Equipment';
import Inventory from './Inventory';
import Scheduling from './Scheduling';
import Logout from './Logout';
import Profile from './Profile';
// Settings components
import PreferencesSettings from './SecuritySettings';
import NotificationsSettings from './NotificationsSettings';
import AccountSettings from './AccountSettings';
import './TechnicianDashboard.css';

export interface UserMenuProfile {
  name: string;
  email: string;
  avatar?: string;
}

const TechnicianDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ✅ Profile state
  const [userMenuProfile, setUserMenuProfile] = useState<UserMenuProfile>({
    name: 'Lab Technician',
    email: 'tech@lab.com',
    avatar: '/api/placeholder/100/100',
  });

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardOverview />;
      case 'samples': return <Samples />;
      case 'tests': return <TestResults />;
      case 'reports': return <TestReports />;
      case 'equipment': return <Equipment />;
      case 'inventory': return <Inventory />;
      case 'scheduling': return <Scheduling />;
      case 'logout': return <Logout />;
      case 'preferences': return <PreferencesSettings />;
      case 'notifications': return <NotificationsSettings />;
      case 'account': return <AccountSettings />;
      case 'profile':
        return (
          <Profile
            userMenuProfile={userMenuProfile}
            setUserMenuProfile={setUserMenuProfile}
          />
        );
      default:
        return (
          <div className="unknown-section">
            <h2>Section Not Found</h2>
            <p>The requested section "{activeSection}" is not available.</p>
          </div>
        );
    }
  };

  return (
    <div className="technician-dashboard">
      {/* Sidebar */}
      <TechnicianSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userMenuProfile={userMenuProfile}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Mobile Hamburger */}
      <button
        className="mobile-hamburger-btn"
        onClick={() => setMobileSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Main Content */}
      <main className={`technician-content ${mobileSidebarOpen ? 'overlayed' : ''}`}>
        <header className="content-header">
          {/* You can add breadcrumbs, title, or actions here */}
        </header>
        <div className="content-wrapper">{renderSection()}</div>
      </main>
    </div>
  );
};

export default TechnicianDashboard;
