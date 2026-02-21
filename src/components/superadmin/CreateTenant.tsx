import React, { useState } from 'react';
import { FiCalendar, FiKey, FiMail, FiCheck } from 'react-icons/fi';
import './CreateTenant.css';
import { useSystemLogs } from '../contexts/SystemLogsContext';
import axios from 'axios';

interface TenantData {
  id: string;
  companyName: string;
  email: string;
  password: string;
  role: 'tenant-admin';
  isPaid: boolean;
  createdBy: string;
  createdAt: string;
  billingPeriod: 'monthly' | 'yearly';
}

// ✅ Set Axios base URL to Django backend
axios.defaults.baseURL = 'http://localhost:8000/';

const CreateTenant: React.FC = () => {
  const { addLog } = useSystemLogs();
  const [tenantData, setTenantData] = useState<Partial<TenantData>>({
    companyName: '',
    email: '',
    billingPeriod: 'monthly',
  });
  const [step, setStep] = useState<number>(1);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTenantData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') validateEmail(value);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!regex.test(email) ? 'Please enter a valid email address' : null);
  };

  const handleBillingChange = (period: 'monthly' | 'yearly') => {
    setTenantData(prev => ({ ...prev, billingPeriod: period }));
  };

  const generateAdminPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length: 12 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const handleCreateTenant = async () => {
    if (!tenantData.companyName || !tenantData.email || emailError) return;

    setLoading(true);
    setApiError(null);
    const password = generateAdminPassword();

    try {
      const response = await axios.post('api/superadmin/tenants/', {
        company_name: tenantData.companyName,
        email: tenantData.email,
        password,
        role: 'tenant-admin',
        is_paid: true,
        created_by: tenantData.email,
        billing_period: tenantData.billingPeriod,
      });

      const createdTenant: TenantData = {
        id: response.data.tenant.id,
        companyName: response.data.tenant.company_name,
        email: response.data.tenant.email,
        password,
        role: 'tenant-admin',
        isPaid: response.data.tenant.is_paid,
        createdBy: response.data.tenant.created_by,
        createdAt: response.data.tenant.created_at,
        billingPeriod: response.data.tenant.billing_period,
      };

      setTenantData(createdTenant);
      setStep(2);

      addLog({
        user: createdTenant.createdBy,
        action: `Created new tenant: ${createdTenant.companyName}`,
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: `Tenant admin email: ${createdTenant.email}`,
      });

    } catch (error: any) {
      console.error(error);
      setApiError('Failed to create tenant. Please try again.');
      addLog({
        user: tenantData.email || 'Unknown',
        action: `Failed to create tenant: ${tenantData.companyName}`,
        status: 'Error',
        ipAddress: '127.0.0.1',
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () =>
    tenantData.companyName?.length! >= 3 &&
    tenantData.email?.length! > 0 &&
    !emailError;

  return (
    <div className="create-tenant-container">
      <div className="create-tenant-header">
        <h1>Create New Tenant</h1>
        <p className="subtitle">Set up your company account</p>
      </div>

      {/* Stepper */}
      <div className="create-tenant-stepper">
        <div className={`step ${step === 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Company Info</span>
        </div>
        <div className={`step ${step === 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Credentials</span>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="create-tenant-form">
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              id="companyName"
              type="text"
              name="companyName"
              value={tenantData.companyName}
              onChange={handleInputChange}
              placeholder="Enter company name"
              className="form-input"
            />
            {tenantData.companyName && tenantData.companyName.length < 3 && (
              <span className="error-message">Company name must be at least 3 characters</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div className="email-input">
              <FiMail className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={tenantData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className={`form-input ${emailError ? 'error' : ''}`}
              />
            </div>
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          <div className="form-group">
            <label>Billing Period *</label>
            <div className="billing-options">
              <button
                type="button"
                className={`billing-option ${tenantData.billingPeriod === 'monthly' ? 'active' : ''}`}
                onClick={() => handleBillingChange('monthly')}
              >
                <FiCalendar className="option-icon" /> Monthly
                <span className="billing-price">$50/month</span>
              </button>
              <button
                type="button"
                className={`billing-option ${tenantData.billingPeriod === 'yearly' ? 'active' : ''}`}
                onClick={() => handleBillingChange('yearly')}
              >
                <FiCalendar className="option-icon" /> Yearly
                <span className="billing-price">$500/year (save $100)</span>
              </button>
            </div>
          </div>

          {apiError && <div className="error-message">{apiError}</div>}

          <div className="form-actions">
            <button
              className="primary-button"
              onClick={handleCreateTenant}
              disabled={!isFormValid() || loading}
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && tenantData.password && (
        <div className="credentials-section">
          <div className="success-message">
            <FiCheck className="success-icon" />
            <h2>Tenant Created Successfully!</h2>
            <p>The tenant account is now active.</p>
          </div>

          <div className="credentials-details">
            <h3>Login Credentials</h3>
            <div><b>Company:</b> {tenantData.companyName}</div>
            <div><b>Email:</b> {tenantData.email}</div>
            <div><b>Password:</b> {tenantData.password} <FiKey /></div>
          </div>

          <div className="important-note">
            <h4>Important:</h4>
            <p>Please save these credentials. They will be required to log in.</p>
          </div>

          <div className="form-actions">
            <button className="primary-button" onClick={() => window.print()}>
              Print Credentials
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTenant;
