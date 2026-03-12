import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './Scheduling.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

type AppointmentType = 'Sample' | 'Test' | 'Instrument' | 'Maintenance' | 'Consultation';
type AppointmentStatus = 'Pending' | 'Confirmed' | 'Declined' | 'Completed' | 'Cancelled' | 'Approved' | 'Scheduled';

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  title: string;
  description?: string;
  status: AppointmentStatus;
  assignedTo: string;
  patientName?: string;
  clinician?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  instrumentId?: string;
  source?: 'Patient' | 'Doctor';
  createdAt: Date;
  updatedAt: Date;
}



const Scheduling: React.FC = () => {
  const { t, language } = useAppSettings();
  const today = new Date().toISOString().split('T')[0];

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const savedScheduled = JSON.parse(localStorage.getItem('appointments') || '[]');
      const savedApproved = JSON.parse(localStorage.getItem('approvedAppointments') || '[]');

      const scheduled = savedScheduled.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      }));

      const approved = savedApproved.map((a: any) => ({
        ...a,
        id: uuidv4(),
        status: 'Approved' as AppointmentStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: a.source || 'Patient',
      }));

      // Merge approved that are not in scheduled
      const merged = [...scheduled];
      approved.forEach((appr: Appointment) => {
        const exists = merged.find(a =>
          a.patientName === appr.patientName &&
          a.date === appr.date &&
          a.startTime === appr.startTime
        );
        if (!exists) merged.push(appr);
      });

      return merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch {
      return [];
    }
  });

  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'list' | 'day'>('list');
  const [filter, setFilter] = useState<{ types: AppointmentType[]; statuses: AppointmentStatus[] }>({ types: [], statuses: [] });

  // Save appointments dynamically
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status, updatedAt: new Date() } : appt));
  };

  const filteredAppointments = appointments.filter(a =>
    (filter.types.length === 0 || filter.types.includes(a.type)) &&
    (filter.statuses.length === 0 || filter.statuses.includes(a.status))
  );

  const dateAppointments = filteredAppointments.filter(a => viewMode === 'list' || a.date === selectedDate);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(language, { weekday: 'short', month: 'short', day: 'numeric' });
  
  const translateAppointmentType = (type: AppointmentType) => {
    const map: Record<AppointmentType, string> = {
      Sample: t('sample_collection'),
      Test: t('test'),
      Instrument: t('instrument_booking'),
      Maintenance: t('maintenance'),
      Consultation: t('consultation')
    };
    return map[type] || type;
  };
  
  const translateAppointmentStatus = (status: AppointmentStatus) => {
    const map: Record<AppointmentStatus, string> = {
      Pending: t('pending'),
      Confirmed: t('confirmed'),
      Declined: t('declined'),
      Completed: t('completed'),
      Cancelled: t('cancelled'),
      Approved: t('approved'),
      Scheduled: t('scheduled')
    };
    return map[status] || status;
  };

  return (
    <section className="scheduling-wrapper">
      <div className="scheduling-container">
        <div className="scheduling-header">
          <h2>{t('laboratory_scheduling')}</h2>
          <div className="scheduling-controls">
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>{t('list_view')}</button>
              <button className={`view-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>{t('day_view')}</button>
            </div>
            <input type="date" value={selectedDate} min={today} onChange={e => setSelectedDate(e.target.value)} />
            {/* New Appointment button removed */}
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>{t('filter_by_type')}:</label>
            <select multiple onChange={e => setFilter({ ...filter, types: Array.from(e.target.selectedOptions, o => o.value as AppointmentType) })}>
              {['Sample', 'Test', 'Instrument', 'Maintenance', 'Consultation'].map(type => (
                <option key={type} value={type}>{translateAppointmentType(type as AppointmentType)}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>{t('filter_by_status')}:</label>
            <select multiple onChange={e => setFilter({ ...filter, statuses: Array.from(e.target.selectedOptions, o => o.value as AppointmentStatus) })}>
              {['Pending', 'Confirmed', 'Declined', 'Completed', 'Cancelled', 'Approved', 'Scheduled'].map(status => (
                <option key={status} value={status}>{translateAppointmentStatus(status as AppointmentStatus)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Appointments List / Day View */}
        {dateAppointments.length === 0 ? (
          <div className="empty-state">
            <p>{t('no_appointments_for_date', )}</p>
            {/* Schedule button removed */}
          </div>
        ) : viewMode === 'day' ? (
          <div className="day-view">
            <div className="time-column">{Array.from({ length: 10 }, (_, i) => 8 + i).map(h => (
              <div key={h} className="time-slot-header">{h}:00</div>
            ))}</div>
            <div className="appointments-column">
              {dateAppointments.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(appt => (
                <div key={appt.id} className={`appointment-card status-${appt.status.toLowerCase()}`}>
                  <div className="appointment-header">
                    <span className="appointment-time">{appt.startTime} - {appt.endTime}</span>
                    <span className={`status-badge status-${appt.status.toLowerCase()}`}>{translateAppointmentStatus(appt.status)}</span>
                  </div>
                  <h4 className="appointment-title">{appt.title}</h4>
                  <p>{appt.patientName} / {appt.clinician}</p>
                  <p>{appt.address}, {appt.city}, {appt.postalCode}</p>
                  <p>{appt.description}</p>
                  {appt.status !== 'Completed' && (
                    <button className="btn btn-complete" onClick={() => updateAppointmentStatus(appt.id, 'Completed')}>{t('complete')}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="scheduling-table">
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('time')}</th>
                  <th>{t('type')}</th>
                  <th>{t('title')}</th>
                  <th>{t('patient')}</th>
                  <th>{t('clinician')}</th>
                  <th>{t('assigned_staff')}</th>
                  <th>{t('address')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {dateAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(appt => (
                  <tr key={appt.id} className={`status-${appt.status.toLowerCase()}`}>
                    <td>{formatDate(appt.date)}</td>
                    <td>{appt.startTime} - {appt.endTime}</td>
                    <td>{translateAppointmentType(appt.type)}</td>
                    <td>{appt.title}</td>
                    <td>{appt.patientName}</td>
                    <td>{appt.clinician}</td>
                    <td>{appt.assignedTo}</td>
                    <td>{appt.address}, {appt.city}, {appt.postalCode}</td>
                    <td>{translateAppointmentStatus(appt.status)}</td>
                    <td>
                      {appt.status !== 'Completed' && <button className="btn btn-complete" onClick={() => updateAppointmentStatus(appt.id, 'Completed')}>{t('complete')}</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Scheduling;