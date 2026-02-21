import React, { useState, useEffect, useCallback } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './ManageDoctors.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  active: boolean;
  joinDate: string;
}

type DoctorInput = Omit<Doctor, 'id' | 'active' | 'joinDate'>;

const ManageDoctors: React.FC = () => {
  const { t } = useAppSettings();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newDoctor, setNewDoctor] = useState<DoctorInput>({
    name: '',
    specialty: '',
    phone: '',
    email: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormValid, setIsFormValid] = useState(false);

  // Load doctors from ManageUsers localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('tenantUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const doctorUsers: Doctor[] = users
          .filter((u: any) => u.role === 'doctor')
          .map((u: any) => ({
            id: u.id,
            name: u.name,
            specialty: u.branch || 'General', // use branch or default
            phone: u.phone || 'N/A',        // if phone exists
            email: u.email,
            active: true,
            joinDate: u.createdAt || new Date().toISOString()
          }));
        setDoctors(doctorUsers);
      } catch (e) {
        console.error('Failed to parse tenantUsers for doctors', e);
      }
    }
  }, []);

  // Save doctors to localStorage separately if needed
  useEffect(() => {
    localStorage.setItem('doctors', JSON.stringify(doctors));
  }, [doctors]);

  // Validate form
  useEffect(() => {
    setIsFormValid(
      newDoctor.name.trim() !== '' &&
      newDoctor.specialty.trim() !== '' &&
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newDoctor.email) &&
      /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(newDoctor.phone)
    );
  }, [newDoctor]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({ ...prev, [name]: value }));
  }, []);

  const addDoctor = useCallback(() => {
    if (!isFormValid) return;

    const newId = `doctor-${Date.now()}`;
    const doctor: Doctor = {
      ...newDoctor,
      id: newId,
      active: true,
      joinDate: new Date().toISOString()
    };
    setDoctors(prev => [...prev, doctor]);
    setNewDoctor({ name: '', specialty: '', phone: '', email: '' });
  }, [newDoctor, isFormValid]);

  const toggleStatus = useCallback((id: string) => {
    setDoctors(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, active: !doc.active } : doc))
    );
  }, []);

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterActive === 'all' ||
      (filterActive === 'active' && doctor.active) ||
      (filterActive === 'inactive' && !doctor.active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="doctors-dashboard">
      <header className="dashboard-header">
        <h1>{t('doctor_management')}</h1>
        <div className="controls">
          <input
            type="text"
            placeholder={t('search_doctors')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label={t('search_doctors')}
          />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="status-filter"
            aria-label={t('filter_by_status')}
          >
            <option value="all">{t('all_doctors')}</option>
            <option value="active">{t('active_only')}</option>
            <option value="inactive">{t('inactive_only')}</option>
          </select>
        </div>
      </header>

      <section className="add-doctor-section">
        <div className="card">
          <h2>{t('add_new_doctor')}</h2>
          <form onSubmit={(e) => { e.preventDefault(); addDoctor(); }}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="doctor-name">{t('full_name')}</label>
                <input
                  id="doctor-name"
                  type="text"
                  name="name"
                  placeholder={t('doctor_name_placeholder')}
                  value={newDoctor.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="specialty">{t('specialty')}</label>
                <input
                  id="specialty"
                  type="text"
                  name="specialty"
                  placeholder={t('specialty_placeholder')}
                  value={newDoctor.specialty}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">{t('phone')}</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder={t('phone_placeholder')}
                  value={newDoctor.phone}
                  onChange={handleInputChange}
                  pattern="^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">{t('email')}</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder={t('email_placeholder')}
                  value={newDoctor.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="add-button" disabled={!isFormValid}>
              {t('add_doctor')}
            </button>
          </form>
        </div>
      </section>

      <section className="doctors-list-section">
        <div className="card">
          <h2>{t('doctor_directory')}</h2>
          <div className="table-container">
            <table className="doctors-table">
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('specialty')}</th>
                  <th>{t('contact')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doc => (
                    <tr key={doc.id} className={!doc.active ? 'inactive' : ''}>
                      <td data-label={t('name')}>
                        <div className="doctor-name">{doc.name}</div>
                        <div className="join-date">{t('joined')}: {new Date(doc.joinDate).toLocaleDateString()}</div>
                      </td>
                      <td data-label={t('specialty')}><span className="specialty-badge">{doc.specialty}</span></td>
                      <td data-label={t('contact')}>
                        <div className="contact-info">
                          <a href={`tel:${doc.phone.replace(/\D/g, '')}`}>{formatPhoneNumber(doc.phone)}</a>
                          <a href={`mailto:${doc.email}`}>{doc.email}</a>
                        </div>
                      </td>
                      <td data-label={t('status')}>
                        <span className={`status-badge ${doc.active ? 'active' : 'inactive'}`}>
                          {doc.active ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td data-label={t('actions')}>
                        <button
                          onClick={() => toggleStatus(doc.id)}
                          className={`status-button ${doc.active ? 'deactivate' : 'activate'}`}
                          aria-label={doc.active ? t('deactivate_doctor') : t('activate_doctor')}
                        >
                          {doc.active ? t('deactivate') : t('activate')}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results">
                    <td colSpan={5}>{t('no_doctors_found')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManageDoctors;
