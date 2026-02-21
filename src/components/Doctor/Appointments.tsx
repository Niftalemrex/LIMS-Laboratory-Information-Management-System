import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaSearch, FaEdit } from 'react-icons/fa';
import './Appointments.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface Appointment {
  id: number;
  patientName: string;
  address: string;
  city: string;
  postalCode: string;
  doctor: string;
  date: string; // ISO string
  reason: string;
  notes: string;
  assignedStaff?: string;
  medicalNeeds: string[];
  updatedAt?: string;
}

const API_URL = "http://127.0.0.1:8000/api/doctor-appointments/"; // Django endpoint

const Appointments: React.FC = () => {
  const { t } = useAppSettings();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    address: '',
    city: '',
    postalCode: '',
    doctor: '',
    date: '',
    reason: '',
    notes: '',
    assignedStaff: '',
    medicalNeeds: ''
  });

  // Load from backend
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error("Error loading appointments:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({ ...prev, [name]: value }));
  };

  const openModalForEdit = (app: Appointment) => {
    setAppointmentForm({
      patientName: app.patientName,
      address: app.address,
      city: app.city,
      postalCode: app.postalCode,
      doctor: app.doctor,
      date: app.date.slice(0, 16), // datetime-local format
      reason: app.reason,
      notes: app.notes,
      assignedStaff: app.assignedStaff || '',
      medicalNeeds: app.medicalNeeds.join(', ')
    });
    setEditingId(app.id);
    setModalOpen(true);
  };

  const saveAppointment = async () => {
    const { patientName, address, city, postalCode, doctor, date, reason, notes, assignedStaff, medicalNeeds } = appointmentForm;
    if (!patientName || !doctor || !date || !reason) {
      alert(t('please_fill_required_fields'));
      return;
    }

    const payload = {
      patientName,
      address,
      city,
      postalCode,
      doctor,
      date,
      reason,
      notes,
      assignedStaff,
      medicalNeeds: medicalNeeds.split(',').map(s => s.trim())
    };

    try {
      if (editingId) {
        const res = await fetch(`${API_URL}${editingId}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        setAppointments(prev => prev.map(app => (app.id === editingId ? updated : app)));
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const newApp = await res.json();
        setAppointments(prev => [...prev, newApp]);
      }
    } catch (err) {
      console.error("Save error:", err);
    }

    setAppointmentForm({
      patientName: '',
      address: '',
      city: '',
      postalCode: '',
      doctor: '',
      date: '',
      reason: '',
      notes: '',
      assignedStaff: '',
      medicalNeeds: ''
    });
    setEditingId(null);
    setModalOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return t('invalid_date');
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredAppointments = appointments.filter(app =>
    app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.postalCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <div className="header-left">
          <h1 className="card-title">{t('appointment_management')}</h1>
          <p className="card-subtitle">{t('manage_patient_appointments')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <FaPlus /> {t('new_appointment')}
        </button>
      </div>

      <div className="controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder={t('search_appointments')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="appointments-table-wrapper">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">{t('no_appointments_found')}</div>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>{t('patient_name')}</th>
                <th>{t('address')}</th>
                <th>{t('doctor')}</th>
                <th>{t('date_time')}</th>
                <th>{t('reason')}</th>
                <th>{t('medical_needs')}</th>
                <th>{t('assigned_staff')}</th>
                <th>{t('notes')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(app => (
                <tr key={app.id}>
                  <td>{app.patientName}</td>
                  <td>{app.address}, {app.city}, {app.postalCode}</td>
                  <td>{app.doctor}</td>
                  <td><FaCalendarAlt className="table-icon" /> {formatDate(app.date)}</td>
                  <td>{app.reason}</td>
                  <td>{app.medicalNeeds.join(', ')}</td>
                  <td>{app.assignedStaff || '-'}</td>
                  <td>{app.notes || '-'}</td>
                  <td>
                    <button className="btn btn-edit" onClick={() => openModalForEdit(app)}>
                      <FaEdit /> {t('edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2>{editingId ? t('edit_appointment') : t('create_new_appointment')}</h2>

            {Object.keys(appointmentForm).map(key => (
              key === 'notes' ? (
                <div className="form-group" key={key}>
                  <label>{t(key)}</label>
                  <textarea name={key} value={(appointmentForm as any)[key]} onChange={handleChange} />
                </div>
              ) : (
                <div className="form-group" key={key}>
                  <label>{t(key)}</label>
                  <input
                    type={key === 'date' ? 'datetime-local' : 'text'}
                    name={key}
                    value={(appointmentForm as any)[key]}
                    onChange={handleChange}
                  />
                </div>
              )
            ))}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setModalOpen(false); setEditingId(null); }}>
                {t('cancel')}
              </button>
              <button className="btn btn-primary" onClick={saveAppointment}>
                {editingId ? t('save_changes') : t('save_appointment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
