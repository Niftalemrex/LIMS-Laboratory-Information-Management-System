import React, { useState } from 'react';
import './TenantAdminDashboard.css';
import TenantAdminSidebar from './TenantAdminSidebar';

// Sections
import DashboardOverview from './DashboardOverview';
import ManageUsers from './ManageUsers';
import ConfigureTests from './ConfigureTests';
import ManageCultures from './ManageCultures';
import ManagePrices from './ManagePrices';
import ManageInventory from './ManageInventory';
import ManageDoctors from './ManageDoctors';
import ManageTechnicians from './ManageTechnicians';
import TestReports from './TestReports';
import LabAnalytics from './LabAnalytics';
import ReceiptsPrinting from './ReceiptsPrinting';
import HomeVisitRequests from './HomeVisitRequests';
import HomeVisitSchedule from './HomeVisitSchedule';
import ContractsDiscounts from './ContractsDiscounts';
import Accounting from './Accounting';
import ManageBranches from './ManageBranches';
import Profile from './Profile';

// Settings
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationsSettings from './NotificationsSettings';
import IntegrationsSettings from './IntegrationsSettings';

export interface UserMenuProfile {
  name: string;
  email: string;
  avatar?: string;
}

const TenantAdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [userMenuProfile, setUserMenuProfile] = useState<UserMenuProfile>({
    name: 'Tenant Admin',
    email: 'admin@lab.com',
    avatar: '/api/placeholder/100/100',
  });

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <DashboardOverview />;
      case 'users': return <ManageUsers />;                     // ← props removed
      case 'tests': return <ConfigureTests />;
      case 'cultures': return <ManageCultures />;
      case 'prices': return <ManagePrices />;
      case 'inventory': return <ManageInventory />;
      case 'doctors': return <ManageDoctors />;
      case 'technicians': return <ManageTechnicians />;
      case 'reports': return <TestReports />;
      case 'analytics': return <LabAnalytics />;
      case 'receipts': return <ReceiptsPrinting />;
      case 'home-visits': return <HomeVisitRequests />;
      case 'home-schedule': return <HomeVisitSchedule />;
      case 'branches': return <ManageBranches />;
      case 'contracts': return <ContractsDiscounts />;
      case 'accounting': return <Accounting />;
      case 'account': return <AccountSettings />;
      case 'notifications': return <NotificationsSettings />;
      case 'security': return <SecuritySettings />;
      case 'integrations': return <IntegrationsSettings />;
      case 'profile': return <Profile userMenuProfile={userMenuProfile} setUserMenuProfile={setUserMenuProfile} />;
      default: return <p>Unknown section</p>;
    }
  };

  return (
    <div className="tenant-dashboard-container">
      <TenantAdminSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setMobileSidebarOpen(false);
        }}
        userMenuProfile={userMenuProfile}
        setUserMenuProfile={setUserMenuProfile}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Mobile Hamburger */}
      <button className="mobile-hamburger-btn" onClick={() => setMobileSidebarOpen(prev => !prev)}>
        ☰
      </button>

      {/* Main Content */}
      <main className={`tenant-main-content ${mobileSidebarOpen ? 'overlayed' : ''}`}>
        <div className="content-wrapper">{renderSection()}</div>
      </main>
    </div>
  );
};

export default TenantAdminDashboard;