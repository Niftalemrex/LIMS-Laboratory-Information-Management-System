import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiChevronRight,
  FiActivity,
  FiUser,
  FiGlobe,
  FiStar,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiCopy,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './AllTenants.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import axios from 'axios';

// ---- TypeScript interface that includes email/password ----
interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  plan: 'Free' | 'Premium' | 'Enterprise' | 'Custom';
  users: number;
  lastActive: string;
  email: string;
  password: string;
}

const AllTenants: React.FC = () => {
  const { t } = useAppSettings();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Tenant; direction: 'asc' | 'desc' } | null>(null);

  // controls whether password is visible per tenant id
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTenants();
  }, []);

  // Fetch tenants from Django backend
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/superadmin/tenants/');
      // Expect response.data to be an array of tenant objects.
      const tenantList: Tenant[] = response.data.map((tenant: any) => ({
        id: tenant.id,
        name: tenant.company_name ?? tenant.name ?? 'Unnamed',
        domain: tenant.company_name
                ? `${tenant.company_name.toLowerCase().replace(/\s+/g, '')}.com`
                : (tenant.domain ?? 'n/a'),
        status: tenant.is_paid ? 'Active' : 'Inactive',
        plan: tenant.billing_period === 'monthly' ? 'Premium' : 'Enterprise',
        users: tenant.user_count ?? 1,
        lastActive: tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A',
        email: tenant.email ?? 'no-email@example.com',
        password: tenant.password ?? '—', // backend must provide this only for testing
      }));

      setTenants(tenantList);
      // Ensure showPasswordMap default false for all tenants
      const initialShowMap: Record<string, boolean> = {};
      tenantList.forEach((t) => (initialShowMap[t.id] = false));
      setShowPasswordMap(initialShowMap);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Tenant) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddNewTenant = () => {
    navigate('/superadmin/createTenant');
  };

  const toggleExpand = (id: string) => {
    setExpandedTenant(expandedTenant === id ? null : id);
  };

  // toggle show/hide password for a specific tenant
  const toggleShowPassword = (id: string) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // copy text to clipboard with a simple accessible flow
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // you can wire to a toast or the system logs; here we console log
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // sorting + filtering
  const sortedTenants = [...tenants].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredTenants = sortedTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'All' || tenant.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const statusOptions = ['All', 'Active', 'Inactive', 'Suspended'];
  const planOptions = ['All', 'Free', 'Premium', 'Enterprise', 'Custom'];

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'Premium': return 'plan-premium';
      case 'Enterprise': return 'plan-enterprise';
      case 'Custom': return 'plan-custom';
      default: return 'plan-free';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'Suspended': return 'status-suspended';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="tenants-container">
        <div className="loading-container">
          <FiRefreshCw className="loading-spinner" />
          <p>{t('loading_tenants')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenants-container">
      <div className="tenants-header">
        <div className="header-left">
          <h2>{t('tenant_management')}</h2>
          <p className="subtitle">{tenants.length} {t('tenants_registered')}</p>
        </div>
        <div className="header-actions">
          <button className="action-button export" onClick={fetchTenants}>
            <FiRefreshCw className="button-icon" />
            {t('refresh')}
          </button>
          <button className="action-button primary" onClick={handleAddNewTenant}>
            <FiPlus className="button-icon" />
            {t('add_new_tenant')}
          </button>
        </div>
      </div>

      <div className="filters-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('search_tenants_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search tenants"
          />
        </div>
        <div className="filter-group">
          <div className="filter-dropdown">
            <FiFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'All' ? t('all_statuses') : t(option.toLowerCase())}
                </option>
              ))}
            </select>
            <FiChevronDown className="chevron-icon" />
          </div>
          <div className="filter-dropdown">
            <FiStar className="filter-icon" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              aria-label="Filter by plan"
            >
              {planOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'All' ? t('all_plans') : t(option.toLowerCase())}
                </option>
              ))}
            </select>
            <FiChevronDown className="chevron-icon" />
          </div>
        </div>
      </div>

      <div className="tenants-table-container">
        <table className="tenants-table" role="table" aria-label="Tenants table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                <div className="header-cell">
                  {t('tenant_name')}
                  {sortConfig?.key === 'name' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('domain')}>
                <div className="header-cell">
                  {t('domain')}
                  {sortConfig?.key === 'domain' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('status')}>
                <div className="header-cell">
                  {t('status')}
                  {sortConfig?.key === 'status' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('plan')}>
                <div className="header-cell">
                  {t('plan')}
                  {sortConfig?.key === 'plan' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('users')}>
                <div className="header-cell">
                  <FiUser className="header-icon" />
                  {sortConfig?.key === 'users' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('lastActive')}>
                <div className="header-cell">
                  {t('last_active')}
                  {sortConfig?.key === 'lastActive' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <React.Fragment key={tenant.id}>
                  <tr 
                    className="tenant-row"
                    onClick={() => toggleExpand(tenant.id)}
                    role="row"
                    aria-expanded={expandedTenant === tenant.id}
                  >
                    <td className="tenant-name">
                      <div className="name-container">
                        {expandedTenant === tenant.id ? (
                          <FiChevronDown className="expand-icon" />
                        ) : (
                          <FiChevronRight className="expand-icon" />
                        )}
                        <span>{tenant.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="domain-cell">
                        <FiGlobe className="domain-icon" />
                        <span>{tenant.domain}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(tenant.status)}`}>
                        {t(tenant.status.toLowerCase())}
                      </span>
                    </td>
                    <td>
                      <span className={`plan-badge ${getPlanColor(tenant.plan)}`}>
                        {t(tenant.plan.toLowerCase())}
                      </span>
                    </td>
                    <td>{tenant.users}</td>
                    <td>{tenant.lastActive}</td>
                    <td>
                      <button 
                        className="action-menu"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Could open a menu
                        }}
                        aria-label={`Actions for ${tenant.name}`}
                      >
                        <FiMoreVertical />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded details: includes Gmail and password */}
                  {expandedTenant === tenant.id && (
                    <tr className="tenant-details">
                      <td colSpan={7}>
                        <div className="details-container">
                          <div className="detail-item">
                            <FiActivity className="detail-icon" />
                            <div>
                              <p className="detail-label">{t('activity')}</p>
                              <p className="detail-value">{t('last_login')}: {tenant.lastActive}</p>
                            </div>
                          </div>

                          <div className="detail-item">
                            <FiUser className="detail-icon" />
                            <div>
                              <p className="detail-label">{t('users')}</p>
                              <p className="detail-value">{tenant.users} {t('active_users')}</p>
                            </div>
                          </div>

                          {/* Gmail (email) */}
                          <div className="detail-item">
                            <FiUser className="detail-icon" />
                            <div>
                              <p className="detail-label">Gmail</p>
                              <p className="detail-value email-row">
                                <span>{tenant.email}</span>
                                <button
                                  className="icon-button"
                                  onClick={() => copyToClipboard(tenant.email)}
                                  aria-label={`Copy email for ${tenant.name}`}
                                  title="Copy email"
                                >
                                  <FiCopy />
                                </button>
                              </p>
                            </div>
                          </div>

                          {/* Password with show/hide and copy */}
                          <div className="detail-item">
                            <FiUser className="detail-icon" />
                            <div>
                              <p className="detail-label">Password</p>
                              <p className="detail-value password-row">
                                <span className="password-text" aria-hidden={!showPasswordMap[tenant.id]}>
                                  {showPasswordMap[tenant.id] ? tenant.password : '••••••••••'}
                                </span>
                                <div className="password-actions">
                                  <button
                                    className="icon-button"
                                    onClick={() => toggleShowPassword(tenant.id)}
                                    aria-label={`${showPasswordMap[tenant.id] ? 'Hide' : 'Show'} password for ${tenant.name}`}
                                    title={showPasswordMap[tenant.id] ? 'Hide password' : 'Show password'}
                                  >
                                    {showPasswordMap[tenant.id] ? <FiEyeOff /> : <FiEye />}
                                  </button>
                                  <button
                                    className="icon-button"
                                    onClick={() => copyToClipboard(tenant.password)}
                                    aria-label={`Copy password for ${tenant.name}`}
                                    title="Copy password"
                                  >
                                    <FiCopy />
                                  </button>
                                </div>
                              </p>
                            </div>
                          </div>

                          <div className="action-buttons">
                            <button className="secondary-button" onClick={() => navigate(`/superadmin/tenants/${tenant.id}/dashboard`)}>
                              {t('view_dashboard')}
                            </button>
                            <button className="secondary-button" onClick={() => navigate(`/superadmin/tenants/${tenant.id}/edit`)}>
                              {t('edit_tenant')}
                            </button>
                            <button className="secondary-button warning">
                              {tenant.status === 'Active' ? t('suspend') : t('activate')}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr className="no-results-row">
                <td colSpan={7}>
                  <div className="no-results">
                    <p>{t('no_tenants_found')}</p>
                    <button 
                      className="clear-filters"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('All');
                        setPlanFilter('All');
                      }}
                    >
                      {t('clear_all_filters')}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredTenants.length > 0 && (
        <div className="table-footer">
          <div className="pagination-info">
            {t('showing_tenants', { 
              start: 1, 
              end: filteredTenants.length, 
              total: filteredTenants.length 
            })}
          </div>
          <div className="pagination-controls">
            <button className="pagination-button" disabled>
              {t('previous')}
            </button>
            <button className="pagination-button active">1</button>
            <button className="pagination-button">
              {t('next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTenants;
