import React, { useState, useEffect } from 'react';
import './Appointments.css';

interface Appointment {
  id: number;
  patient?: number | null;
  patient_name: string;
  with_whom: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
}

const API_BASE = 'http://localhost:8000/api/patient-appointments/';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'request' | 'edit'>('request');
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);

  // Form state
  const [patientName, setPatientName] = useState('');
  const [withWhom, setWithWhom] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const token = localStorage.getItem('authToken');

  // Normalize backend data
  const normalizeAppointments = (data: any[]): Appointment[] => {
    return data.map(d => ({
      id: d.id,
      patient: d.patient ?? null,
      patient_name: d.patient_name || (d.patient?.username ?? 'Unknown'),
      with_whom: d.with_whom || 'Unknown',
      date: d.date || '',
      time: d.time ? d.time.slice(0, 5) : '',
      location: d.location || 'Unknown',
      notes: d.notes || '',
    }));
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const res = await fetch(API_BASE, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data: any[] = await res.json();
      setAppointments(normalizeAppointments(data));
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  // Open modals
  const openRequestModal = () => {
    setModalMode('request');
    setCurrentAppointment(null);
    setPatientName('');
    setWithWhom('');
    setDate('');
    setTime('');
    setLocation('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (appt: Appointment) => {
    setModalMode('edit');
    setCurrentAppointment(appt);
    setPatientName(appt.patient_name);
    setWithWhom(appt.with_whom);
    setDate(appt.date);
    setTime(appt.time);
    setLocation(appt.location);
    setNotes(appt.notes || '');
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !withWhom || !date || !time || !location) {
      alert('Please fill all required fields.');
      return;
    }

    const payload = {
      patient_name: patientName,
      with_whom: withWhom,
      date,
      time: time.length === 5 ? `${time}:00` : time,
      location,
      notes,
    };

    try {
      let res: Response | undefined;
      if (modalMode === 'request') {
        res = await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else if (modalMode === 'edit' && currentAppointment) {
        res = await fetch(`${API_BASE}${currentAppointment.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res || !res.ok) throw new Error('Failed to save appointment');

      alert('Appointment saved successfully!');
      closeModal();

      // Reload appointments from backend to ensure table is up-to-date
      await fetchAppointments();

    } catch (err) {
      console.error(err);
      alert('Failed to save appointment.');
    }
  };

  return (
    <section className="appointments-container">
      <h1 className="title">Appointments</h1>
      <button className="btn btn-primary" onClick={openRequestModal}>
        + Add Appointment
      </button>

      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>With</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt.id}>
                <td>{appt.patient_name}</td>
                <td>{appt.with_whom}</td>
                <td>{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.location}</td>
                <td>{appt.notes || '-'}</td>
                <td>
                  <button
                    onClick={() => openEditModal(appt)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalMode === 'request' ? 'Add Appointment' : 'Edit Appointment'}</h2>
            <form onSubmit={handleSubmit}>
              <label>Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                required
              />

              <label>With</label>
              <input
                value={withWhom}
                onChange={e => setWithWhom(e.target.value)}
                required
              />

              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />

              <label>Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              />

              <label>Location</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />

              <label>Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Appointments;
