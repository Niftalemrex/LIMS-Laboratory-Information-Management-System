import React, { useState, useEffect } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './HomeVisitSchedule.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface Visit {
  id: string;
  patientName: string;
  patientId: string;
  address: string;
  city: string;
  postalCode: string;
  start: Date;
  end: Date;
  clinician?: string;
  clinicianId?: string;
  visitType: 'Routine' | 'Follow-up' | 'Urgent';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  medicalNeeds: string[];
  notes?: string;
  requestedDate?: string;
  preferredTime?: string;
  assignedStaff?: string;
}

// LocalStorage keys
const DOCTOR_APPROVED_KEY = 'approvedHomeVisits';
const PATIENT_APPROVED_KEY = 'approvedPatientVisits';
const SCHEDULE_KEY = 'homeVisitSchedule';

const localizer = momentLocalizer(moment);

const HomeVisitSchedule: React.FC = () => {
  const { t } = useAppSettings();

  const [approvedVisits, setApprovedVisits] = useState<Visit[]>([]);
  const [scheduledVisits, setScheduledVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'day' | 'week' | 'month' | 'agenda'>('week');
  const [date, ] = useState(new Date());

  // Load approved visits from both doctor and patient keys
  useEffect(() => {
    const savedDoctor = localStorage.getItem(DOCTOR_APPROVED_KEY);
    const savedPatient = localStorage.getItem(PATIENT_APPROVED_KEY);
    const savedScheduled = localStorage.getItem(SCHEDULE_KEY);

    const doctorApproved: Visit[] = savedDoctor ? JSON.parse(savedDoctor).map((v:any) => ({
      ...v,
      start: new Date(v.date),
      end: new Date(new Date(v.date).getTime() + 60*60*1000),
      status: 'Approved'
    })) : [];

    const patientApproved: Visit[] = savedPatient ? JSON.parse(savedPatient).map((v:any) => ({
      ...v,
      start: new Date(v.date),
      end: new Date(new Date(v.date).getTime() + 60*60*1000),
      status: 'Approved'
    })) : [];

    const parsedScheduled: Visit[] = savedScheduled ? JSON.parse(savedScheduled).map((v:any) => ({
      ...v,
      start: new Date(v.start),
      end: new Date(v.end)
    })) : [];

    // Merge both approved keys
    setApprovedVisits([...doctorApproved, ...patientApproved]);
    setScheduledVisits(parsedScheduled);
  }, []);

  // Merge approved visits into scheduled visits dynamically
  useEffect(() => {
    const newSchedules: Visit[] = [];
    approvedVisits.forEach(av => {
      const exists = scheduledVisits.find(sv => sv.patientId === av.patientId && sv.start.getTime() === av.start.getTime());
      if (!exists) {
        newSchedules.push({
          ...av,
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          start: new Date(av.start),
          end: new Date(av.end),
          clinician: av.assignedStaff || t('unassigned'),
          clinicianId: av.assignedStaff || 'unassigned',
          visitType: 'Routine',
          status: 'Scheduled'
        });
      }
    });
    if (newSchedules.length) {
      setScheduledVisits(prev => [...prev, ...newSchedules]);
    }
  }, [approvedVisits, scheduledVisits, t]);

  // Save scheduled visits to localStorage
  useEffect(() => {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(scheduledVisits));
  }, [scheduledVisits]);

  // Loading indicator
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Helpers
  const formatAddress = (v: Visit) => `${v.address}, ${v.city}, ${v.postalCode}`;
  const formatTime = (date: Date) => moment(date).format('h:mm A');
  const formatDate = (date: Date) => moment(date).format('MMMM D, YYYY');

  const eventStyleGetter = (event: Visit) => {
    let backgroundColor = '';
    switch (event.visitType) {
      case 'Urgent': backgroundColor = '#ffebee'; break;
      case 'Follow-up': backgroundColor = '#e3f2fd'; break;
      default: backgroundColor = '#e8f5e9';
    }
    return { style: { backgroundColor, borderRadius: '6px', border: '0px', color: '#000', padding: '4px', fontWeight: 500 } };
  };

  const updateVisitStatus = (id: string, newStatus: 'In Progress' | 'Completed' | 'Cancelled') => {
    setScheduledVisits(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    setSelectedVisit(null);
  };

  return (
    <div className="home-visit-schedule">
      <header className="schedule-header">
        <h1>{t('home_visit_schedule')}</h1>
        <div className="view-controls">
          {['day','week','month','agenda'].map(v => (
            <button key={v} onClick={() => setView(v as any)} className={view===v?'active':''}>{t(v)}</button>
          ))}
        </div>
      </header>

      <section className="approved-cards">
        {approvedVisits.length ? approvedVisits.map(av => (
          <div key={av.id} className="approved-card">
            <h3>{av.patientName}</h3>
            <p><strong>{t('date')}:</strong> {formatDate(av.start)}</p>
            <p><strong>{t('time')}:</strong> {formatTime(av.start)} - {formatTime(av.end)}</p>
            <p><strong>{t('assigned_staff')}:</strong> {av.assignedStaff || t('unassigned')}</p>
            <p><strong>{t('medical_needs')}:</strong> {av.medicalNeeds.join(', ')}</p>
          </div>
        )) : <p>{t('no_approved_visits')}</p>}
      </section>

      <div className="schedule-content">
        {isLoading ? (
          <div className="loading-indicator">{t('loading_schedule')}</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={scheduledVisits}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '70vh' }}
            view={view}
            views={['day','week','month','agenda']}
            date={date}
            onSelectEvent={setSelectedVisit}
            eventPropGetter={eventStyleGetter}
            components={{
              event: ({ event }) => (
                <div>
                  <div>{event.patientName}</div>
                  <div>{formatTime(event.start)} - {formatTime(event.end)}</div>
                  <div>{event.visitType}</div>
                </div>
              )
            }}
          />
        )}
      </div>

      {selectedVisit && (
        <div className="visit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('visit_details')}</h2>
              <button onClick={() => setSelectedVisit(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>{t('patient_name')}:</strong> {selectedVisit.patientName}</p>
              <p><strong>{t('address')}:</strong> {formatAddress(selectedVisit)}</p>
              <p><strong>{t('date')}:</strong> {formatDate(selectedVisit.start)}</p>
              <p><strong>{t('time')}:</strong> {formatTime(selectedVisit.start)} - {formatTime(selectedVisit.end)}</p>
              <p><strong>{t('clinician')}:</strong> {selectedVisit.clinician}</p>
              <p><strong>{t('status')}:</strong> {selectedVisit.status}</p>
            </div>
            <div className="modal-footer">
              {selectedVisit.status === 'Scheduled' && <>
                <button onClick={() => updateVisitStatus(selectedVisit.id,'In Progress')}>{t('start_visit')}</button>
                <button onClick={() => updateVisitStatus(selectedVisit.id,'Cancelled')}>{t('cancel_visit')}</button>
              </>}
              {selectedVisit.status === 'In Progress' && <button onClick={() => updateVisitStatus(selectedVisit.id,'Completed')}>{t('complete_visit')}</button>}
              <button onClick={() => setSelectedVisit(null)}>{t('close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeVisitSchedule;
