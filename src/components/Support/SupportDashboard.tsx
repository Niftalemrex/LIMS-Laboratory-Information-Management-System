import React, { useState } from 'react';
import SupportSidebar from './SupportSidebar';
import './SupportDashboard.css';

import Dashboard from './Dashboard';
import Inventory from './Inventory';
import Alerts from './Alerts';
import Reorders from './Reorders';
import Logout from './Logout';
import Tickets from './SupportTickets';
import Team from './TeamManagement';
import Messages from './SupportMessages';
import Profile from './Profile';

// Import settings components
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationsSettings from './NotificationsSettings';

export interface UserMenuProfile {
  name: string;
  email: string;
  avatar?: string;
}

const SupportDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userMenuProfile, setUserMenuProfile] = useState<UserMenuProfile>({
    name: 'Support Admin',
    email: 'support@system.com',
    avatar: '/api/placeholder/100/100',
  });

  // Mobile sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'alerts': return <Alerts />;
      case 'reorders': return <Reorders />;
      case 'tickets': return <Tickets />;
      case 'team': return <Team />;
      case 'messages': return <Messages />;
      case 'logout': return <Logout />;
      case 'accountSettings': return <AccountSettings />;
      case 'securitySettings': return <SecuritySettings />;
      case 'notificationSettings': return <NotificationsSettings />;
      case 'profile':
        return (
          <Profile
            userMenuProfile={userMenuProfile}
            setUserMenuProfile={setUserMenuProfile}
          />
        );
      default: return <Dashboard />;
    }
  };

  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);

  return (
    <div className="support-dashboard-container">
      {/* Sidebar */}
      <SupportSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setMobileSidebarOpen(false); // close sidebar on mobile
        }}
        userMenuProfile={userMenuProfile}
        setUserMenuProfile={setUserMenuProfile}
        mobileOpen={mobileSidebarOpen} // pass state for responsive sidebar
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Mobile hamburger button */}
      <button className="mobile-hamburger-btn" onClick={toggleMobileSidebar}>
        ☰
      </button>

      {/* Main content */}
      <main className={`support-main-content ${mobileSidebarOpen ? 'overlayed' : ''}`}>
        {renderSection()}
      </main>
    </div>
  );
};

export default SupportDashboard;
