import React, { useState, useEffect } from 'react';
import { FiUpload, FiCamera, FiSearch, FiCheck, FiAlertCircle } from 'react-icons/fi';
import './Samples.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

type SampleStatus = 'Received' | 'Processing' | 'Completed' | 'Pending' | 'Rejected';
type SamplePriority = 'Routine' | 'Urgent' | 'STAT';

interface Sample {
  id: string;
  patient: string;
  test: string;
  status: SampleStatus;
  collectionDate: string;
  priority: SamplePriority;
  assignedTo: string;
}

interface TestRequest {
  id: string;
  patient: string;
  test: string;
  requestedAt: string;
  priority: SamplePriority;
}

const TEST_REQUEST_BASE = "http://127.0.0.1:8000/api/test-requests";
const ACCEPT_SAMPLE_BASE = "http://127.0.0.1:8000/api/accept";
const SAMPLES_BASE = "http://127.0.0.1:8000/api/samples";

const Samples: React.FC = () => {
  const { t } = useAppSettings();

  const [samples, setSamples] = useState<Sample[]>([]);
  const [requests, setRequests] = useState<TestRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SampleStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<SamplePriority | 'All'>('All');

  const statusOptions: SampleStatus[] = ['Received', 'Processing', 'Completed', 'Pending', 'Rejected'];
  const priorityOptions: SamplePriority[] = ['Routine', 'Urgent', 'STAT'];

  // ----------------- Fetch Samples -----------------
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch(SAMPLES_BASE);
        if (!res.ok) throw new Error("Failed to fetch samples");
        const data: any[] = await res.json();

        // Deduplicate by patient + test + collectionDate
        const uniqueSamples: Sample[] = Array.from(
          new Map(data.map(s => [`${s.patient}_${s.test}_${s.collection_date}`, {
            id: s.id.toString(),
            patient: s.patient,
            test: s.test,
            status: s.status,
            collectionDate: s.collection_date,
            priority: s.priority,
            assignedTo: s.assigned_to || 'Unassigned'
          }])).values()
        );

        setSamples(uniqueSamples);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSamples();
  }, []);

  // ----------------- Fetch Requests -----------------
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(TEST_REQUEST_BASE);
        if (!res.ok) throw new Error("Failed to fetch test requests");
        const data: any[] = await res.json();

        // Filter out requests already in samples
        const newRequests: TestRequest[] = data
          .filter(r => !samples.some(s => 
            s.patient === r.patient_name &&
            s.test === r.test_type &&
            new Date(s.collectionDate).toDateString() === new Date(r.created_at).toDateString()
          ))
          .map(r => ({
            id: r.id.toString(),
            patient: r.patient_name,
            test: r.test_type,
            requestedAt: r.created_at,
            priority: r.priority === 'Normal' ? 'Routine' : r.priority === 'Urgent' ? 'Urgent' : 'STAT'
          }));

        setRequests(newRequests);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [samples]);

  // ----------------- Accept Request -----------------
  const handleAcceptRequest = async (id: string) => {
    try {
      const res = await fetch(`${ACCEPT_SAMPLE_BASE}/${id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error("Failed to accept test request");

      const sampleData = await res.json();

      // Remove request
      setRequests(prev => prev.filter(r => r.id !== id));

      // Only add if patient+test+date is not already in samples
      setSamples(prev => {
        const exists = prev.some(s => 
          s.patient === sampleData.patient &&
          s.test === sampleData.test &&
          new Date(s.collectionDate).toDateString() === new Date(sampleData.collection_date).toDateString()
        );
        if (exists) return prev;

        return [...prev, {
          id: sampleData.id.toString(),
          patient: sampleData.patient,
          test: sampleData.test,
          status: sampleData.status,
          collectionDate: sampleData.collection_date,
          priority: sampleData.priority,
          assignedTo: sampleData.assigned_to || 'Unassigned'
        }];
      });
    } catch (err) {
      console.error(err);
      alert("Failed to accept the test request.");
    }
  };

  // ----------------- Status Change -----------------
  const handleStatusChange = (id: string, newStatus: SampleStatus) => {
    setSamples(prev =>
      prev.map(s => s.id === id ? { ...s, status: newStatus } : s)
    );
  };

  // ----------------- Actions -----------------
  const handleScan = (id: string) => alert(t('scanning_sample') || `Scanning sample ${id}`);
  const handleUpload = (id: string) => alert(t('uploading_sample') || `Uploading sample ${id}`);

  // ----------------- Filtered Samples -----------------
  const filteredSamples = samples.filter(s => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.test.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || s.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // ----------------- Render -----------------
  return (
    <section className="sample-management">
      <div className="management-header">
        <div className="header-content">
          <h1>{t('sample_management') || 'Sample Management'}</h1>
          <p>{t('sample_management_subtitle') || 'Track and manage laboratory samples throughout the testing process'}</p>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="test-requests">
          <h2>{t('new_test_requests') || 'New Test Requests'}</h2>
          <ul>
            {requests.map(req => (
              <li key={req.id} className={`priority-${req.priority.toLowerCase()}`}>
                <span>{req.patient} - {req.test} ({req.priority})</span>
                <button className="btn primary" onClick={() => handleAcceptRequest(req.id)}>
                  <FiCheck /> {t('accept') || 'Accept'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="filters-container">
        <div className="search-filter">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('search_samples') || 'Search samples...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="dropdown-filters">
          <div className="filter-group">
            <label>{t('status') || 'Status'}</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as SampleStatus | 'All')}>
              <option value="All">{t('all_statuses') || 'All Statuses'}</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>{t('priority') || 'Priority'}</label>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as SamplePriority | 'All')}>
              <option value="All">{t('all_priorities') || 'All Priorities'}</option>
              {priorityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="sample-table-container">
        <table className="sample-table">
          <thead>
            <tr>
              <th>{t('sample_id') || 'Sample ID'}</th>
              <th>{t('patient') || 'Patient'}</th>
              <th>{t('test') || 'Test'}</th>
              <th>{t('collection_date') || 'Collection Date'}</th>
              <th>{t('priority') || 'Priority'}</th>
              <th>{t('status') || 'Status'}</th>
              <th>{t('assigned_to') || 'Assigned To'}</th>
              <th>{t('actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSamples.length > 0 ? filteredSamples.map(s => (
              <tr key={s.id} className={`priority-${s.priority.toLowerCase()}`}>
                <td>
                  <span className="sample-id">{s.id}</span>
                  {s.priority === 'STAT' && <span className="priority-badge stat"><FiAlertCircle /> STAT</span>}
                  {s.priority === 'Urgent' && <span className="priority-badge urgent">Urgent</span>}
                </td>
                <td>{s.patient}</td>
                <td>{s.test}</td>
                <td>{new Date(s.collectionDate).toLocaleDateString()}</td>
                <td><span className={`priority-tag ${s.priority.toLowerCase()}`}>{s.priority}</span></td>
                <td>
                  <select
                    className={`status-select status-${s.status.toLowerCase()}`}
                    value={s.status}
                    onChange={e => handleStatusChange(s.id, e.target.value as SampleStatus)}
                  >
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td>{s.assignedTo || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn icon scan-btn" onClick={() => handleScan(s.id)} type="button"><FiCamera /></button>
                    <button className="btn icon upload-btn" onClick={() => handleUpload(s.id)} disabled={s.status !== 'Completed'} type="button"><FiUpload /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr className="no-results">
                <td colSpan={8}>No samples found matching your criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Samples;
