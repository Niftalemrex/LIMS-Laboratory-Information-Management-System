// src/components/tenantadmin/ManageUsers.tsx
import React, { useState, useEffect } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useTenantLogs } from '../contexts/TenantLogsContext';
import './ManageUsers.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch?: string;
  password?: string;
  created_by: string; // match backend field
  created_at: string;
  tenant: string;
}

interface TenantData {
  id: number;
  company_name: string;
  email: string;
  created_at: string;
}

interface AddUserResponse {
  tenant_user?: User;
  [key: string]: any;
}

const ManageUsers: React.FC = () => {
  const { t } = useAppSettings();
  const { addLog } = useTenantLogs();

  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', email: '', role: '', branch: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);

  const API_USERS = 'http://127.0.0.1:8000/api/tenant/users/';
  const API_CURRENT_TENANT = 'http://127.0.0.1:8000/api/tenant/current/';

  // Fetch current tenant
  const fetchCurrentTenant = async () => {
    try {
      const res = await fetch(API_CURRENT_TENANT);
      if (!res.ok) throw new Error('Failed to fetch current tenant');
      const data: TenantData = await res.json();
      setTenant(data);
    } catch (err: any) {
      console.error(err);
      setError(t('tenant_not_found'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingTenant(false);
    }
  };

  // Fetch users for current tenant
  const fetchUsers = async () => {
    if (!tenant) return;
    try {
      const res = await fetch(`${API_USERS}?tenant=${tenant.id}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: User[] = await res.json();
      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      setError(t('failed_fetch_users'));
      setTimeout(() => setError(''), 3000);
    }
  };

  useEffect(() => { fetchCurrentTenant(); }, []);
  useEffect(() => { if (tenant) fetchUsers(); }, [tenant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => Math.random().toString(36).slice(-8);

  const handleAddUser = async () => {
    // Validate fields
    if (!newUser.name?.trim() || !newUser.role || !newUser.email?.trim()) {
      setError(t('fill_all_fields'));
      addLog({ user: 'system', action: 'Attempted to add user with missing fields', status: 'Error', ipAddress: '127.0.0.1', details: 'Some fields were empty' });
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
      setError(t('valid_email'));
      addLog({ user: 'system', action: 'Invalid email format when adding user', status: 'Error', ipAddress: '127.0.0.1', details: `Email entered: ${newUser.email}` });
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!tenant) {
      setError(t('tenant_not_found'));
      return;
    }

    const password = generatePassword();
    const payload = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      branch: newUser.branch || undefined,
      password,
      tenant: tenant.id,
      created_by: tenant.email, // ✅ fix: match backend field name
    };

    try {
      const res = await fetch(API_USERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: AddUserResponse = await res.json();

      if (!res.ok) {
        console.error('Backend validation errors:', data);
        const firstError = Object.values(data)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError || t('failed_add_user'));
      }

      if (!data.tenant_user) throw new Error(t('failed_add_user'));

      setUsers(prev => data.tenant_user ? [...prev, data.tenant_user] : prev);

      setNewUser({ name: '', email: '', role: '', branch: '' });
      setSuccess(`${t('user_added')}. ${t('password')}: ${password}`);
      addLog({ user: tenant.email, action: `Added new user: ${data.tenant_user.name} (${data.tenant_user.email})`, status: 'Success', ipAddress: '127.0.0.1', details: `Role: ${data.tenant_user.role}, Branch: ${data.tenant_user.branch}` });
      setTimeout(() => setSuccess(''), 5000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || t('failed_add_user'));
      setTimeout(() => setError(''), 5000);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingTenant) return <div className="manage-users-container">{t('loading_tenant')}</div>;

  return (
    <div className="manage-users-container">
      <div className="users-header">
        <h2>{t('user_management')} - {tenant?.company_name}</h2>
        <p>{t('manage_users_permissions')}</p>
      </div>

      <div className="search-container">
        <input type="text" placeholder={t('search_users')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" aria-label={t('search_users')} />
        <span className="search-icon">🔍</span>
      </div>

      {/* Add User Form */}
      <div className="user-form-card">
        <h3>{t('add_new_user')}</h3>
        <form className="add-user-form" onSubmit={e => { e.preventDefault(); handleAddUser(); }}>
          <div className="form-row">
            <div className="form-group">
              <label>{t('full_name')} *</label>
              <input type="text" name="name" placeholder={t('enter_full_name')} value={newUser.name} onChange={handleInputChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label>{t('email')} *</label>
              <input type="email" name="email" placeholder={t('enter_email')} value={newUser.email} onChange={handleInputChange} className="form-input" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('role')} *</label>
              <select name="role" value={newUser.role} onChange={handleInputChange} className="form-select" required>
                <option value="">{t('select_role')}</option>
                <option value="doctor">{t('doctor')}</option>
                <option value="technician">{t('technician')}</option>
                <option value="support">{t('support_staff')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('branch')}</label>
              <select name="branch" value={newUser.branch} onChange={handleInputChange} className="form-select">
                <option value="">{t('select_branch')}</option>
                <option value="main">{t('main_branch')}</option>
                <option value="west">{t('west_branch')}</option>
                <option value="east">{t('east_branch')}</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">{t('add_user')}</button>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </form>
      </div>

      {/* Users Table */}
      <div className="users-table-card">
        <h3>{t('user_directory')}</h3>
        <p className="table-summary">{t('showing_users', { count: filteredUsers.length, total: users.length })}</p>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('email')}</th>
                <th>{t('role')}</th>
                <th>{t('branch')}</th>
                <th>{t('tenant')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="no-data">{t('no_users_found')}</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-id">ID: {user.id}</div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td>{user.branch || t('not_assigned')}</td>
                    <td>{tenant?.company_name}</td>
                    <td><span className="status-badge status-active">{t('active')}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
