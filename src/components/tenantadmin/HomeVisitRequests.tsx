import React, { useState, useCallback, useEffect } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './HomeVisitRequests.css';

interface VisitRequest {
  id: string;
  appointment_id: string;
  patientName: string;
  patientId?: string;
  doctor?: string;
  doctorId?: string;
  address: string;
  city: string;
  postalCode: string;
  date: string;
  reason: string;
  notes?: string;
  assignedStaff?: string;
  medicalNeeds: string[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  updatedAt?: string;
}

const HomeVisitRequests: React.FC = () => {
  const { t } = useAppSettings();

  const [doctorRequests, setDoctorRequests] = useState<VisitRequest[]>([]);
  const [patientRequests, setPatientRequests] = useState<VisitRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: 'All' as 'All' | VisitRequest['status'],
    search: '',
    dateRange: 'all' as 'upcoming' | 'past' | 'all'
  });

  const [sortConfig, setSortConfig] = useState<{ key: keyof VisitRequest; direction: 'asc' | 'desc' } | null>(null);

  /** Convert API -> frontend model */
  const sanitizeVisitRequest = (d: any): VisitRequest => ({
    id: String(d.id ?? ''),
    appointment_id: d.appointment_id ?? String(d.id ?? ''),
    patientName: d.patient_name ?? d.patient?.username ?? '',
    patientId: d.patient?.id ?? d.patient_id ?? '',
    doctor: d.doctor_name ?? d.with_whom ?? d.doctor?.username ?? '',
    doctorId: d.doctor?.id ?? d.doctor_id ?? '',
    address: d.address ?? d.location ?? '',
    city: d.city ?? '',
    postalCode: d.postal_code ?? '',
    date: d.date ?? '',
    reason: d.reason ?? '',
    notes: d.notes ?? '',
    assignedStaff: d.assigned_staff ?? '',
    medicalNeeds: d.medical_needs ?? [],
    status: d.status ?? 'Pending',
    updatedAt: d.updated_at ?? ''
  });

  /** Load doctor & patient requests */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, patientRes] = await Promise.all([
          fetch('http://localhost:8000/api/doctor-appointments/'),
          fetch('http://localhost:8000/api/patient-appointments/')
        ]);

        const doctorData = await doctorRes.json();
        const patientData = await patientRes.json();

        setDoctorRequests(doctorData.map(sanitizeVisitRequest));
        setPatientRequests(patientData.map(sanitizeVisitRequest));
      } catch (err) {
        console.error('Error fetching home visit requests:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /** Filter change */
  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  /** Sorting */
  const requestSort = useCallback((key: keyof VisitRequest) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  }, [sortConfig]);

  /** Sorting + filtering */
  const sortAndFilter = useCallback((requests: VisitRequest[]) => {
    const searchLower = filters.search.toLowerCase();
    let sorted = [...requests];

    if (sortConfig) {
      sorted.sort((a, b) => {
        const aVal = (a[sortConfig.key] ?? '').toString();
        const bVal = (b[sortConfig.key] ?? '').toString();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sorted.filter(r => {
      const matchesStatus = filters.status === 'All' || r.status === filters.status;
      const matchesSearch =
        (r.patientName ?? '').toLowerCase().includes(searchLower) ||
        (r.address ?? '').toLowerCase().includes(searchLower) ||
        (r.city ?? '').toLowerCase().includes(searchLower) ||
        (r.reason ?? '').toLowerCase().includes(searchLower) ||
        (r.notes ?? '').toLowerCase().includes(searchLower);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const requestDate = new Date(r.date ?? '');
      const matchesDateRange =
        filters.dateRange === 'all' ||
        (filters.dateRange === 'upcoming' && requestDate >= today) ||
        (filters.dateRange === 'past' && requestDate < today);

      return matchesStatus && matchesSearch && matchesDateRange;
    });
  }, [filters, sortConfig]);

  /** Format date */
  const formatDateTime = (dateTimeString: string) => {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return t('invalid_date');
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  /** Update status + send approval API */
  const updateStatus = useCallback(async (
    id: string,
    newStatus: 'Approved' | 'Rejected' | 'Completed',
    isPatientRequest: boolean = false
  ) => {
    const requestsState = isPatientRequest ? patientRequests : doctorRequests;
    const setRequestsState = isPatientRequest ? setPatientRequests : setDoctorRequests;
    const localT = t('current_user');
    const approvedReq = requestsState.find(r => r.id === id);
    if (!approvedReq) return;

    const assignedStaff = localT;

    // Update locally
    setRequestsState(prev =>
      prev.map(r => r.id === id ? { ...r, status: newStatus, assignedStaff, updatedAt: new Date().toISOString() } : r)
    );

    // Send only when approving
    if (newStatus === 'Approved') {
      const idField = isPatientRequest ? approvedReq.patientId : approvedReq.doctorId;
      if (!idField) {
        alert(t('missing_doctor_or_patient_id'));
        console.warn('Cannot approve, missing ID:', approvedReq);
        return;
      }

      try {
        const apiUrl = isPatientRequest
          ? `http://localhost:8000/api/approved-patient/`
          : `http://localhost:8000/api/approved-doctor/`;

        const payload = isPatientRequest
          ? {
              appointment_id: approvedReq.appointment_id,
              patient_id: idField,
              assigned_staff: assignedStaff,
              date: approvedReq.date || null,
              address: approvedReq.address || '',
              city: approvedReq.city || '',
              postal_code: approvedReq.postalCode || '',
              doctor_name: approvedReq.doctor || '',
              reason: approvedReq.reason || '',
              notes: approvedReq.notes || '',
              medical_needs: approvedReq.medicalNeeds || []
            }
          : {
              appointment_id: approvedReq.appointment_id,
              doctor_id: idField,
              assigned_staff: assignedStaff,
              patient_name: approvedReq.patientName || '',
              date: approvedReq.date || null,
              address: approvedReq.address || '',
              city: approvedReq.city || '',
              postal_code: approvedReq.postalCode || '',
              reason: approvedReq.reason || '',
              notes: approvedReq.notes || '',
              medical_needs: approvedReq.medicalNeeds || []
            };

        console.log('Sending payload:', payload);

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error('Approval failed:', errData);
        }
      } catch (err) {
        console.error('Failed to save approved appointment:', err);
      }
    }
  }, [doctorRequests, patientRequests, t]);

  /** Action buttons */
  const getStatusActions = (request: VisitRequest, isPatientRequest: boolean = false) => {
    const missingId = isPatientRequest ? !request.patientId : !request.doctorId;
    switch (request.status) {
      case 'Pending':
        return (
          <>
            <button
              onClick={() => updateStatus(request.id, 'Approved', isPatientRequest)}
              className={`approve-button ${missingId ? 'disabled' : ''}`}
              disabled={missingId}
              title={missingId ? t('missing_doctor_or_patient_id') : undefined}
            >
              {t('approve')}
            </button>
            <button onClick={() => updateStatus(request.id, 'Rejected', isPatientRequest)} className="reject-button">{t('reject')}</button>
          </>
        );
      case 'Approved':
        return <button onClick={() => updateStatus(request.id, 'Completed', isPatientRequest)} className="complete-button">{t('mark_completed')}</button>;
      default:
        return null;
    }
  };

  /** Sort arrow */
  const getSortIndicator = (key: keyof VisitRequest) => (!sortConfig || sortConfig.key !== key ? '↕' : sortConfig.direction === 'asc' ? '↑' : '↓');

  /** Render requests */
  const renderTable = (requests: VisitRequest[], isPatientRequest: boolean = false, title: string) => {
    const filtered = sortAndFilter(requests);
  
    return (
      <div className="table-section">
        <h2>{title}</h2>
        <table className="visits-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('patientName')}>{t('patient')} {getSortIndicator('patientName')}</th>
              <th>{t('address')}</th>
              <th onClick={() => requestSort('date')}>{t('date_time')} {getSortIndicator('date')}</th>
              {!isPatientRequest && <th>{t('doctor')}</th>}
              {/* Conditional columns */}
              {!isPatientRequest && null /* doctor requests: remove medicalNeeds & assignedStaff */}
              {isPatientRequest && null /* patient requests: remove reason, medicalNeeds, assignedStaff */}
              <th>{t('notes')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(r => (
              <tr key={r.id} className={`status-${r.status.toLowerCase()}`}>
                <td>{r.patientName}</td>
                <td>{r.address}, {r.city}, {r.postalCode}</td>
                <td>{formatDateTime(r.date)}</td>
                {!isPatientRequest && <td>{r.doctor || <span className="missing">Missing</span>}</td>}
                {/* Remove columns based on type */}
                {!isPatientRequest /* doctor requests */ ? null : null /* patient requests */}
                <td>{r.notes || '-'}</td>
                <td>{r.status}</td>
                <td>{getStatusActions(r, isPatientRequest)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={isPatientRequest ? 5 : 6}>{t('no_home_visit_requests_found')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="home-visits-dashboard">
      <header className="dashboard-header">
        <h1>{t('home_visit_requests')}</h1>
        <div className="controls">
          <input
            type="text"
            placeholder={t('search_patients_or_addresses')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="status-filter">
            <option value="All">{t('all_statuses')}</option>
            <option value="Pending">{t('pending')}</option>
            <option value="Approved">{t('approved')}</option>
            <option value="Rejected">{t('rejected')}</option>
            <option value="Completed">{t('completed')}</option>
          </select>
          <select value={filters.dateRange} onChange={(e) => handleFilterChange('dateRange', e.target.value)} className="date-filter">
            <option value="upcoming">{t('upcoming')}</option>
            <option value="past">{t('past')}</option>
            <option value="all">{t('all_dates')}</option>
          </select>
        </div>
      </header>
      <div className="dashboard-content">
        {isLoading
          ? <p>{t('loading_home_visit_requests')}</p>
          : <>
              {renderTable(doctorRequests, false, t('doctor_requests'))}
              {renderTable(patientRequests, true, t('patient_requests'))}
            </>
        }
      </div>
    </div>
  );
};

export default HomeVisitRequests;
