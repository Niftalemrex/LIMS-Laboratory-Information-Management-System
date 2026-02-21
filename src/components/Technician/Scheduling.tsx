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

interface TimeSlot {
  time: string;
  available: boolean;
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
      approved.forEach(appr => {
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>>({
    date: selectedDate,
    startTime: '09:00',
    endTime: '09:30',
    type: 'Sample',
    title: '',
    description: '',
    assignedTo: '',
    patientName: '',
    clinician: '',
    address: '',
    city: '',
    postalCode: '',
    instrumentId: '',
    source: 'Patient'
  });

  const [filter, setFilter] = useState<{ types: AppointmentType[]; statuses: AppointmentStatus[] }>({ types: [], statuses: [] });

  // Save appointments dynamically
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status, updatedAt: new Date() } : appt));
  };

  const handleCreateAppointment = () => {
    if (!newAppointment.title.trim()) return;
    const appointment: Appointment = {
      id: uuidv4(),
      ...newAppointment,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAppointments(prev => [...prev, appointment]);
    setIsModalOpen(false);
    setNewAppointment({ ...newAppointment, title: '', description: '', startTime: '09:00', endTime: '09:30' });
  };

  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const existing = appointments.filter(a => a.date === date);
    for (let hour = 8; hour < 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const available = !existing.some(a => time >= a.startTime && time < a.endTime);
        slots.push({ time, available });
      }
    }
    return slots;
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
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>{t('new_appointment')}</button>
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
            <p>{t('no_appointments_for_date', { date: formatDate(selectedDate) })}</p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>{t('schedule_new_appointment')}</button>
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

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{t('new_appointment')}</h3>
                <button onClick={() => setIsModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t('date')}</label>
                  <input type="date" value={newAppointment.date} min={today} onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('start_time')}</label>
                    <select value={newAppointment.startTime} onChange={e => setNewAppointment({ ...newAppointment, startTime: e.target.value })}>
                      {generateTimeSlots(newAppointment.date).map(slot => (
                        <option key={slot.time} value={slot.time} disabled={!slot.available}>{slot.time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('end_time')}</label>
                    <select value={newAppointment.endTime} onChange={e => setNewAppointment({ ...newAppointment, endTime: e.target.value })}>
                      {generateTimeSlots(newAppointment.date).filter(slot => slot.time > newAppointment.startTime).map(slot => (
                        <option key={slot.time} value={slot.time}>{slot.time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('type')}</label>
                  <select value={newAppointment.type} onChange={e => setNewAppointment({ ...newAppointment, type: e.target.value as AppointmentType })}>
                    {['Sample', 'Test', 'Instrument', 'Maintenance', 'Consultation'].map(type => (
                      <option key={type} value={type}>{translateAppointmentType(type as AppointmentType)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('title')}*</label>
                  <input type="text" value={newAppointment.title} onChange={e => setNewAppointment({ ...newAppointment, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('description')}</label>
                  <textarea value={newAppointment.description} onChange={e => setNewAppointment({ ...newAppointment, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setIsModalOpen(false)}>{t('cancel')}</button>
                <button onClick={handleCreateAppointment} disabled={!newAppointment.title.trim()}>{t('create_appointment')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Scheduling;
