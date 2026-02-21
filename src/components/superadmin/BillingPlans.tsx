import React, { useState } from 'react';
import { 
  FiCheckCircle, 
  FiArrowUpRight, 
  FiCreditCard, 
  FiDownload,
  FiPlus,
  FiZap,
  FiBarChart2,
  FiUsers,
  FiHeadphones,
  FiLifeBuoy
} from 'react-icons/fi';
import './BillingPlans.css';
import { useAppSettings } from '../contexts/AppSettingsContext'; // Adjust import path as needed

interface BillingRecord {
  id: string;
  date: string;
  invoiceNumber: string;
  plan: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
  downloadUrl: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  billingCycle: string;
  features: {
    icon: React.ReactNode;
    text: string;
    tooltip?: string;
  }[];
  cta: {
    text: string;
    variant: 'primary' | 'secondary' | 'outline';
    action: () => void;
  };
  isCurrent?: boolean;
  recommended?: boolean;
}

const BillingPlans: React.FC = () => {
  const { t } = useAppSettings();
  const [activeTab, setActiveTab] = useState<'plans' | 'history' | 'payment'>('plans');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const billingHistory: BillingRecord[] = [
    { 
      id: 'inv-2025-07-001',
      date: t('date_format', ),
      invoiceNumber: 'INV-2025-07-001',
      plan: t('starter'),
      amount: '$29.00',
      status: t('paid'),
      downloadUrl: '#'
    },
    { 
      id: 'inv-2025-06-001',
      date: t('date_format',),
      invoiceNumber: 'INV-2025-06-001',
      plan: t('starter'),
      amount: '$29.00',
      status: t('paid'),
      downloadUrl: '#'
    },
    { 
      id: 'inv-2025-05-001',
      date: t('date_format', ),
      invoiceNumber: 'INV-2025-05-001',
      plan: t('starter'),
      amount: '$29.00',
      status: t('paid'),
      downloadUrl: '#'
    },
  ];

  const plans: Plan[] = [
    {
      id: 'starter',
      name: t('starter'),
      price: '$29',
      billingCycle: t('per_month'),
      isCurrent: true,
      features: [
        { icon: <FiZap />, text: t('projects_feature',) },
        { icon: <FiUsers />, text: t('team_members_feature', ) },
        { icon: <FiBarChart2 />, text: t('basic_analytics') },
        { icon: <FiHeadphones />, text: t('email_support') }
      ],
      cta: {
        text: t('current_plan'),
        variant: 'secondary',
        action: () => {}
      }
    },
    {
      id: 'pro',
      name: t('professional'),
      price: '$59',
      billingCycle: t('per_month'),
      recommended: true,
      features: [
        { icon: <FiZap />, text: t('unlimited_projects') },
        { icon: <FiUsers />, text: t('team_members_feature',) },
        { icon: <FiBarChart2 />, text: t('advanced_analytics') },
        { icon: <FiHeadphones />, text: t('priority_support'), tooltip: t('priority_support_tooltip') },
        { icon: <FiLifeBuoy />, text: t('api_access') }
      ],
      cta: {
        text: t('upgrade_plan'),
        variant: 'primary',
        action: () => setActiveTab('plans')
      }
    },
    {
      id: 'enterprise',
      name: t('enterprise'),
      price: t('custom'),
      billingCycle: '',
      features: [
        { icon: <FiZap />, text: t('custom_solutions') },
        { icon: <FiUsers />, text: t('unlimited_team_members') },
        { icon: <FiBarChart2 />, text: t('advanced_reporting') },
        { icon: <FiHeadphones />, text: t('dedicated_support'), tooltip: t('dedicated_support_tooltip') },
        { icon: <FiLifeBuoy />, text: t('onboarding_assistance') },
        { icon: <FiCheckCircle />, text: t('custom_integrations') }
      ],
      cta: {
        text: t('contact_sales'),
        variant: 'outline',
        action: () => window.location.href = `mailto:sales@example.com?subject=${t('enterprise_plan_inquiry')}`
      }
    }
  ];

  const paymentMethods = [
    { id: 'visa', last4: '4242', brand: 'Visa', exp: t('expiry_format',), isDefault: true },
    { id: 'mastercard', last4: '4444', brand: 'Mastercard', exp: t('expiry_format', ), isDefault: false }
  ];

  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'failed': return 'failed';
      default: return '';
    }
  };
  

  return (
    <div className="billing-container">
      <header className="billing-header">
        <div>
          <h1>{t('billing_plans')}</h1>
          <p className="subtitle">{t('manage_subscription')}</p>
        </div>
        <div className="header-actions">
          <button className="download-button">
            <FiDownload className="icon" />
            {t('download_all_invoices')}
          </button>
        </div>
      </header>

      <nav className="billing-tabs">
        <button 
          className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          {t('plans')}
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          {t('billing_history')}
        </button>
        <button 
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          {t('payment_methods')}
        </button>
      </nav>

      {activeTab === 'plans' && (
        <section className="plans-section">
          <div className="plans-grid">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`plan-card ${plan.isCurrent ? 'current' : ''} ${plan.recommended ? 'recommended' : ''}`}
              >
                {plan.recommended && (
                  <div className="recommended-badge">{t('recommended')}</div>
                )}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="amount">{plan.price}</span>
                    {plan.billingCycle && (
                      <span className="billing-cycle">/{plan.billingCycle}</span>
                    )}
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <span className="feature-icon">{feature.icon}</span>
                      <span className="feature-text">{feature.text}</span>
                      {feature.tooltip && (
                        <span className="tooltip">{feature.tooltip}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  className={`plan-button ${plan.cta.variant} ${plan.isCurrent ? 'current' : ''}`}
                  onClick={plan.cta.action}
                  disabled={plan.isCurrent}
                >
                  {plan.cta.text}
                  {!plan.isCurrent && <FiArrowUpRight className="button-icon" />}
                </button>
              </div>
            ))}
          </div>

          <div className="plan-comparison">
            <h3>{t('plan_comparison')}</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>{t('feature')}</th>
                  <th>{t('starter')}</th>
                  <th>{t('professional')}</th>
                  <th>{t('enterprise')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t('projects')}</td>
                  <td>10</td>
                  <td>{t('unlimited')}</td>
                  <td>{t('unlimited')}</td>
                </tr>
                <tr>
                  <td>{t('users')}</td>
                  <td>5</td>
                  <td>25</td>
                  <td>{t('unlimited')}</td>
                </tr>
                <tr>
                  <td>{t('support')}</td>
                  <td>{t('email')}</td>
                  <td>{t('priority')}</td>
                  <td>{t('dedicated')}</td>
                </tr>
                <tr>
                  <td>{t('analytics')}</td>
                  <td>{t('basic')}</td>
                  <td>{t('advanced')}</td>
                  <td>{t('advanced')}</td>
                </tr>
                <tr>
                  <td>{t('api_access')}</td>
                  <td>-</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'history' && (
        <section className="history-section">
          <div className="history-filters">
            <div className="filter-group">
              <label htmlFor="period">{t('period')}</label>
              <select id="period" className="filter-select">
                <option>{t('last_12_months')}</option>
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="status">{t('status')}</label>
              <select id="status" className="filter-select">
                <option>{t('all_statuses')}</option>
                <option>{t('paid')}</option>
                <option>{t('pending')}</option>
                <option>{t('failed')}</option>
              </select>
            </div>
          </div>

          <table className="history-table">
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('invoice_number')}</th>
                <th>{t('plan')}</th>
                <th>{t('amount')}</th>
                <th>{t('status')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.invoiceNumber}</td>
                  <td>{record.plan}</td>
                  <td>{record.amount}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button className="download-invoice">
                      <FiDownload className="icon" />
                      {t('download')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'payment' && (
        <section className="payment-section">
          <div className="payment-methods">
            <h3>{t('payment_methods')}</h3>
            <div className="cards-list">
              {paymentMethods.map((method) => (
                <div key={method.id} className="payment-card">
                  <div className="card-brand">{method.brand}</div>
                  <div className="card-number">•••• •••• •••• {method.last4}</div>
                  <div className="card-expiry">{t('expires')} {method.exp}</div>
                  {method.isDefault && (
                    <div className="default-badge">{t('default')}</div>
                  )}
                  <button className="card-action">{t('edit')}</button>
                </div>
              ))}
            </div>
            <button 
              className="add-card-button"
              onClick={() => setShowPaymentForm(!showPaymentForm)}
            >
              <FiPlus className="icon" />
              {t('add_payment_method')}
            </button>
          </div>

          {showPaymentForm && (
            <div className="payment-form">
              <h4>{t('add_new_card')}</h4>
              <div className="form-row">
                <label htmlFor="cardNumber">{t('card_number')}</label>
                <input 
                  id="cardNumber"
                  type="text"
                  placeholder={t('card_number_placeholder')}
                />
              </div>
              <div className="form-row">
                <label htmlFor="cardName">{t('name_on_card')}</label>
                <input 
                  id="cardName"
                  type="text"
                  placeholder={t('name_on_card_placeholder')}
                />
              </div>
              <div className="form-columns">
                <div className="form-row">
                  <label htmlFor="expiry">{t('expiry_date')}</label>
                  <input 
                    id="expiry"
                    type="text"
                    placeholder={t('expiry_placeholder')}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="cvv">{t('cvv')}</label>
                  <input 
                    id="cvv"
                    type="text"
                    placeholder="123"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="secondary-button"
                  onClick={() => setShowPaymentForm(false)}
                >
                  {t('cancel')}
                </button>
                <button className="primary-button">
                  {t('save_card')}
                </button>
              </div>
            </div>
          )}

          <div className="payment-providers">
            <h4>{t('supported_payment_providers')}</h4>
            <div className="providers-grid">
              <div className="provider-logo">
                <img src="/stripe-logo.svg" alt="Stripe" />
              </div>
              <div className="provider-logo">
                <img src="/paypal-logo.svg" alt="PayPal" />
              </div>
              <div className="provider-logo">
                <img src="/visa-logo.svg" alt="Visa" />
              </div>
              <div className="provider-logo">
                <img src="/mastercard-logo.svg" alt="Mastercard" />
              </div>
              <div className="provider-logo">
                <img src="/amex-logo.svg" alt="American Express" />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BillingPlans;