import React, { useState, type ChangeEvent } from 'react';
import './SuperAdminDashboard.css';
import SuperAdminSidebar from './SuperAdminSidebar';
import DashboardOverview from './DashboardOverview';
import AllTenants from './AllTenants';
import CreateTenant from './CreateTenant';
import TenantUsage from './TenantUsage';
import BillingPlans from './BillingPlans';
import AssignTenantAdmin from './AssignTenantAdmin';
import SystemLogs from './SystemLogs';
import Logout from './Logout';
import Profile from './Profile';
// Settings
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationsSettings from './NotificationsSettings';
import IntegrationsSettings from './IntegrationsSettings';
import GlobalNotifications from './GlobalNotifications';
import Monitoring from './Monitoring';
import BackupDatabase from './BackupDatabase';

interface Tenant {
  id: number;
  name: string;
  domain: string;
  status: string;
  plan?: string;
}

export interface UserMenuProfile {
  name: string;
  email: string;
  avatar?: string;
}

const tenantsMock: Tenant[] = [
  { id: 1, name: 'Green Hospital', domain: 'green.lims.com', status: 'Active', plan: 'Free' },
  { id: 2, name: 'Sunrise Lab', domain: 'sunrise.lims.com', status: 'Pending', plan: 'Premium' },
];

const SuperAdminDashboard: React.FC = () => {
  const [userMenuProfile, setUserMenuProfile] = useState<UserMenuProfile>({
    name: 'Super Admin',
    email: 'admin@system.com',
    avatar: '/api/placeholder/100/100',
  });
  const [tenants, setTenants] = useState<Tenant[]>(tenantsMock);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // handle tenant input if needed
  };

  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardOverview />;
      case 'create': return <CreateTenant newTenant={{name:'',domain:'',plan:'Free'}} onInputChange={handleInputChange} onCreate={() => {}} />;
      case 'tenants': return <AllTenants tenants={tenants} />;
      case 'usage': return <TenantUsage />;
      case 'billing': return <BillingPlans />;
      case 'assign': return <AssignTenantAdmin tenants={tenants} onAssign={() => {}} />;
      case 'logs': return <SystemLogs />;
      case 'global-notifications': return <GlobalNotifications />;
      case 'monitoring': return <Monitoring />;
      case 'backup': return <BackupDatabase />;
      case 'account-settings': return <AccountSettings />;
      case 'security': return <SecuritySettings />;
      case 'notifications': return <NotificationsSettings />;
      case 'integrations': return <IntegrationsSettings />;
      case 'profile': return <Profile userMenuProfile={userMenuProfile} setUserMenuProfile={setUserMenuProfile} />;
      case 'logout': return <Logout />;
      default: return <p>Section not found</p>;
    }
  };

  return (
    <div className="superadmin-dashboard-container">

      {/* Sidebar */}
      <SuperAdminSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setMobileSidebarOpen(false); // close sidebar on mobile
        }}
        userMenuProfile={userMenuProfile}
        setUserMenuProfile={setUserMenuProfile}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Mobile Hamburger */}
      <button className="mobile-hamburger-btn" onClick={toggleMobileSidebar}>
        ☰
      </button>

      {/* Main Content */}
      <main className={`superadmin-main-content ${mobileSidebarOpen ? 'overlayed' : ''}`}>
        <div className="content-wrapper">{renderSection()}</div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
