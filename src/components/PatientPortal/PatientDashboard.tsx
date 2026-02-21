import React, { useState } from 'react';
import PatientSidebar from './PatientSidebar';
import './PatientDashboard.css';

import Dashboard from './Dashboard';
import TestResults from './TestResults';
import Appointments from './Appointments';
import Messages from './Messages';
import FAQ from './FAQ';
import Support from './Support';
import PatientGuides from './PatientGuides';
import Profile from './Profile';
import Settings from './AccountSettings';
import Logout from './Logout';

const PatientPortal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'test-results':
        return <TestResults />;
      case 'appointments':
        return <Appointments />;
      case 'messages':
        return <Messages />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'logout':
        return <Logout />;
      case 'faq':
        return <FAQ />;
      case 'support':
        return <Support />;
      case 'guides':
        return <PatientGuides />;
      default:
        return <Dashboard />;
    }
  };

  const handleCloseMobile = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="patient-portal-container">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={handleCloseMobile}></div>
      )}

      {/* Sidebar */}
      <PatientSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setMobileSidebarOpen(false);
        }}
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
      <main className={`patient-portal-content ${mobileSidebarOpen ? 'overlayed' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default PatientPortal;
