// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context providers
import { AppSettingsProvider } from './components/contexts/AppSettingsContext';
import { SupportStoreProvider } from './components/Support/SupportStore';
import { SystemLogsProvider } from './components/contexts/SystemLogsContext';
import { TenantLogsProvider } from './components/contexts/TenantLogsContext';

// Dashboards
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import TenantAdminDashboard from './components/tenantadmin/TenantAdminDashboard';
import TechnicianDashboard from './components/Technician/TechnicianDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import SupportDashboard from './components/Support/SupportDashboard';
import PatientDashboard from './components/PatientPortal/PatientDashboard';

// Auth
import TenantAccessAuth from './components/TenantAccessAuth/TenantAccessAuth';
import TenantPaymentPage from './components/TenantAccessAuth/TenantPaymentPage';

// SuperAdmin components
import Integration from './components/superadmin/IntegrationsSettings';
import CreateTenant from './components/superadmin/CreateTenant';
import SystemLog from './components/superadmin/SystemLogs';
import AllTenants from './components/superadmin/AllTenants';

// Styles
import './App.css';

function App() {
  const tenantId = 'dynamic-tenant-id'; // replace dynamically as needed

  return (
    <AppSettingsProvider>
      <SupportStoreProvider>
        <SystemLogsProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 py-6">
                  <Routes>
                    {/* Auth & Role Dashboards */}
                    <Route path="/TenantAccessAuth" element={<TenantAccessAuth />} />
                    <Route path="/TenantPaymentPage" element={<TenantPaymentPage />} />

                    <Route path="/SuperAdminDashboard" element={<SuperAdminDashboard />} />

                    {/* Tenant dashboards wrapped with TenantLogsProvider */}
                    <Route
                      path="/TenantAdminDashboard"
                      element={
                        <TenantLogsProvider tenantId={tenantId}>
                          <TenantAdminDashboard />
                        </TenantLogsProvider>
                      }
                    />
                    <Route
                      path="/TechnicianDashboard"
                      element={
                        <TenantLogsProvider tenantId={tenantId}>
                          <TechnicianDashboard />
                        </TenantLogsProvider>
                      }
                    />
                    <Route
                      path="/DoctorDashboard"
                      element={
                        <TenantLogsProvider tenantId={tenantId}>
                          <DoctorDashboard />
                        </TenantLogsProvider>
                      }
                    />
                    <Route
                      path="/SupportDashboard"
                      element={
                        <TenantLogsProvider tenantId={tenantId}>
                          <SupportDashboard />
                        </TenantLogsProvider>
                      }
                    />
                    <Route
                      path="/PatientDashboard"
                      element={
                        <TenantLogsProvider tenantId={tenantId}>
                          <PatientDashboard />
                        </TenantLogsProvider>
                      }
                    />

                    {/* SuperAdmin routes */}
                    <Route path="/superadmin/IntegrationsSettings" element={<Integration />} />
                    <Route path="/superadmin/createTenant" element={<CreateTenant />} />
                    <Route path="/superadmin/manageTenant" element={<AllTenants />} />
                    <Route path="/superadmin/systemLog" element={<SystemLog />} />

                    {/* Default route */}
                    <Route
                      path="/"
                      element={
                        <TenantLogsProvider tenantId={tenantId}>
                          <PatientDashboard/>
                        </TenantLogsProvider>
                      }
                    />
                  </Routes>
                </div>
              </main>
            </div>
          </Router>
        </SystemLogsProvider>
      </SupportStoreProvider>
    </AppSettingsProvider>
  );
}

export default App;
