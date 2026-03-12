import React, { useState, useEffect, useMemo } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './ManageTechnicians.css';

interface Technician {
  id: string;
  name: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  lastVisit: string; // Could be last assignment or last login
  status: 'active' | 'inactive';
  certification?: string; // Optional field specific to technicians
}

interface StoredUser {
  id: string;
  name: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email: string;
  lastVisit?: string;
  status?: string;
  role: string;
  certification?: string;
}

const ManageTechnicians: React.FC = () => {
  const { t } = useAppSettings();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Technician; direction: 'ascending' | 'descending' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load technicians from tenantUsers localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('tenantUsers');
    if (storedUsers) {
      try {
        const users: StoredUser[] = JSON.parse(storedUsers);
        const technicianUsers: Technician[] = users
          .filter((u) => u.role === 'technician')
          .map((u) => ({
            id: u.id,
            name: u.name,
            dob: u.dob || '2000-01-01',
            gender: u.gender || 'Other',
            phone: u.phone || 'N/A',
            email: u.email,
            lastVisit: u.lastVisit || new Date().toISOString(),
            status: u.status === 'inactive' ? 'inactive' : 'active',
            certification: u.certification,
          }));
        setTechnicians(technicianUsers);
      } catch (e) {
        console.error('Failed to parse tenantUsers for technicians', e);
      }
    }
    setIsLoading(false);
  }, []);

  const requestSort = (key: keyof Technician) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTechnicians = useMemo(() => {
    if (!sortConfig) return technicians;

    return [...technicians].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined (should not happen with our defaults, but just in case)
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1; // null/undefined goes to end
      if (bValue == null) return -1;

      // Convert to string for safe comparison (all fields are strings or numbers that stringify nicely)
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    });
  }, [technicians, sortConfig]);

  const filteredTechnicians = sortedTechnicians.filter((tech) => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.phone.includes(searchTerm) ||
      tech.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || tech.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getSortIndicator = (key: keyof Technician) => {
    if (!sortConfig || sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div className="technicians-dashboard">
      <header className="dashboard-header">
        <h1>{t('technician_management')}</h1>
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder={t('search_technicians')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label={t('search_technicians')}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="status-filter"
              aria-label={t('filter_by_status')}
            >
              <option value="all">{t('all_technicians')}</option>
              <option value="active">{t('active_only')}</option>
              <option value="inactive">{t('inactive_only')}</option>
            </select>
          </div>
          <div className="technician-count">
            {t('showing_technicians', { count: filteredTechnicians.length, total: technicians.length })}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>{t('loading_technician_data')}</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="technicians-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('name')}>{t('name')} {getSortIndicator('name')}</th>
                    <th onClick={() => requestSort('dob')}>{t('age_dob')} {getSortIndicator('dob')}</th>
                    <th onClick={() => requestSort('gender')}>{t('gender')} {getSortIndicator('gender')}</th>
                    <th>{t('contact')}</th>
                    <th onClick={() => requestSort('lastVisit')}>{t('last_visit')} {getSortIndicator('lastVisit')}</th>
                    <th>{t('status')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTechnicians.length > 0 ? (
                    filteredTechnicians.map((tech) => (
                      <tr key={tech.id}>
                        <td>
                          <div className="technician-name">{tech.name}</div>
                          {tech.certification && <div className="certification-badge">{tech.certification}</div>}
                        </td>
                        <td>
                          <div>{calculateAge(tech.dob)} {t('years')}</div>
                          <div className="secondary-text">{formatDate(tech.dob)}</div>
                        </td>
                        <td>
                          <span className={`gender-badge ${tech.gender.toLowerCase()}`}>{tech.gender}</span>
                        </td>
                        <td>
                          <div className="contact-info">
                            <a href={`tel:${tech.phone.replace(/\D/g, '')}`}>{tech.phone}</a>
                            <a href={`mailto:${tech.email}`}>{tech.email}</a>
                          </div>
                        </td>
                        <td>{formatDate(tech.lastVisit)}</td>
                        <td>
                          <span className={`status-badge ${tech.status}`}>
                            {tech.status === 'active' ? t('active') : t('inactive')}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button className="view-button"><span role="img" aria-label={t('view')}>👁️</span> {t('view')}</button>
                          <button className="edit-button"><span role="img" aria-label={t('edit')}>✏️</span> {t('edit')}</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-results">
                      <td colSpan={7}>{t('no_technicians_found')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTechnicians;