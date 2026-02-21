import React, { useState } from 'react';
import DoctorSidebar from './DoctorSidebar';
import './DoctorDashboard.css';

// Section pages
import DashboardHome from './DashboardHome';
import NewTestRequest from './NewTestRequest';
import TestResults from './TestResults';
import Appointments from './Appointments';
import QuickActions from './QuickActions';
import Logout from './Logout';
import Profile from './Profile';
// Settings pages
import Preferences from './SecuritySettings';
import NotificationsSettings from './NotificationsSettings';
import AccountSettings from './AccountSettings';

export interface UserMenuProfile {
  name: string;
  email: string;
  avatar?: string;
}

const DoctorDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [userMenuProfile, setUserMenuProfile] = useState<UserMenuProfile>({
    name: 'Dr. Smith',
    email: 'doctor@hospital.com',
    avatar: '/api/placeholder/100/100',
  });

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardHome />;
      case 'newRequest': return <NewTestRequest />;
      case 'testResults': return <TestResults />;
      case 'appointments': return <Appointments />;
      case 'quickActions': return <QuickActions />;
      case 'preferences': return <Preferences />;
      case 'notifications': return <NotificationsSettings />;
      case 'account': return <AccountSettings />;
      case 'logout': return <Logout />;
      case 'profile':
        return <Profile userMenuProfile={userMenuProfile} setUserMenuProfile={setUserMenuProfile} />;
      default:
        return (
          <div className="section-not-found">
            <h2>Section Not Found</h2>
            <p>The requested section could not be loaded.</p>
          </div>
        );
    }
  };

  return (
    <div className="doctor-dashboard-container">
      {/* Sidebar */}
      <DoctorSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setMobileSidebarOpen(false); // auto-close on mobile
        }}
        userMenuProfile={userMenuProfile}
        setUserMenuProfile={setUserMenuProfile}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Mobile Overlay */}
      {mobileSidebarOpen && <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />}

      {/* Mobile Hamburger */}
      <button
        className="mobile-hamburger-btn"
        onClick={() => setMobileSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Main Content */}
      <main className={`doctor-main-content ${mobileSidebarOpen ? 'overlayed' : ''}`}>
        <div className="content-wrapper">{renderSection()}</div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
