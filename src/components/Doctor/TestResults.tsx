import React, { useState, useEffect } from 'react';
import './TestResults.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { FaCheck, FaTimes, FaDownload, FaSearch } from 'react-icons/fa';
import { MdOutlinePendingActions } from 'react-icons/md';

// Doctor-friendly type
type TestStatus = 'Awaiting Approval' | 'Approved' | 'Rejected';
type ISODateString = string;

interface TestResult {
  id: string;
  patientName: string;
  testType: string;
  result: string;
  status: TestStatus;
  date: ISODateString;
  comments?: string;
}

// LocalStorage keys
const LAB_KEY = 'lab_test_results';
const DOCTOR_KEY = 'doctor_test_results';

const getCurrentDate = (): ISODateString => new Date().toISOString().split('T')[0];

const TestResults: React.FC = () => {
  const { t } = useAppSettings();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [comment, setComment] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Load and merge results
  useEffect(() => {
    const labRaw = localStorage.getItem(LAB_KEY);
    const doctorRaw = localStorage.getItem(DOCTOR_KEY);
    const labResults: any[] = labRaw ? JSON.parse(labRaw) : [];
    const doctorResults: TestResult[] = doctorRaw ? JSON.parse(doctorRaw) : [];

    const mappedLabResults: TestResult[] = labResults.map(lr => ({
      id: lr.id,
      patientName: lr.patient || lr.testName || 'Unknown',
      testType: lr.testName,
      result: lr.resultValue || '',
      status: 'Awaiting Approval',
      date: lr.date || getCurrentDate(),
      comments: lr.notes || ''
    }));

    const merged = [
      ...mappedLabResults.filter(lr => !doctorResults.find(dr => dr.id === lr.id)),
      ...doctorResults
    ];
    setTestResults(merged);
  }, []);

  // Save approved/rejected results
  useEffect(() => {
    const approvedResults = testResults.filter(r => r.status !== 'Awaiting Approval');
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(approvedResults));
  }, [testResults]);

  // Approve/reject handlers
  const handleApprove = (id: string) => {
    setTestResults(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: 'Approved', comments: comment || t('approved_without_comments'), date: getCurrentDate() }
          : r
      )
    );
    setSelectedId(null);
    setComment('');
  };

  const handleReject = (id: string) => {
    if (!comment.trim()) { alert(t('please_provide_comment')); return; }
    setTestResults(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'Rejected', comments: comment, date: getCurrentDate() } : r)
    );
    setSelectedId(null);
    setComment('');
  };

  // Filtered results
  const filteredResults = testResults.filter(r =>
    (r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || r.testType.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All' || r.status === statusFilter)
  );

  const getStatusBadge = (status: TestStatus) => {
    const classMap = {
      'Awaiting Approval': 'status awaiting-approval',
      'Approved': 'status approved',
      'Rejected': 'status rejected'
    };
    const iconMap = {
      'Awaiting Approval': <MdOutlinePendingActions className="status-icon pending" />,
      'Approved': <FaCheck className="status-icon approved" />,
      'Rejected': <FaTimes className="status-icon rejected" />
    };
    return <div className={classMap[status]}>{iconMap[status]} {t(status.toLowerCase().replace(/ /g, '_'))}</div>;
  };

  // ===== CSV Download Function for All =====
  const handleDownloadAll = () => {
    if (filteredResults.length === 0) { alert(t('no_test_results_found')); return; }
    downloadCSV(filteredResults, `doctor_test_results_${getCurrentDate()}.csv`);
  };

  // ===== CSV Download Function for Single Patient =====
  const handleDownloadSingle = (result: TestResult) => {
    downloadCSV([result], `test_result_${result.patientName}_${getCurrentDate()}.csv`);
  };

  // ===== Generic CSV Generator =====
  const downloadCSV = (data: TestResult[], fileName: string) => {
    const csvHeader = ['ID','Patient Name','Test Type','Result','Status','Comments','Date'].join(',');
    const csvRows = data.map(r =>
      [
        `"${r.id}"`,
        `"${r.patientName}"`,
        `"${r.testType}"`,
        `"${r.result}"`,
        `"${r.status}"`,
        `"${r.comments || ''}"`,
        `"${r.date}"`
      ].join(',')
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="test-results-section">
      {/* Header */}
      <div className="results-header">
        <h1>{t('test_results_management')}</h1>
        <div className="controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t('search_patients_or_tests')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">{t('all_statuses')}</option>
              <option value="Awaiting Approval">{t('pending')}</option>
              <option value="Approved">{t('approved')}</option>
              <option value="Rejected">{t('rejected')}</option>
            </select>
          </div>
          <button className="btn-download-all" onClick={handleDownloadAll}>
            <FaDownload /> {t('download_all')}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="results-summary">
        <div className="summary-card pending">
          <p>{testResults.filter(r => r.status === 'Awaiting Approval').length}</p>
          <h3>{t('pending')}</h3>
        </div>
        <div className="summary-card approved">
          <p>{testResults.filter(r => r.status === 'Approved').length}</p>
          <h3>{t('approved')}</h3>
        </div>
        <div className="summary-card rejected">
          <p>{testResults.filter(r => r.status === 'Rejected').length}</p>
          <h3>{t('rejected')}</h3>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="results-table">
          <thead>
            <tr>
              <th>{t('patient')}</th>
              <th>{t('test_type')}</th>
              <th>{t('result')}</th>
              <th>{t('status')}</th>
              <th>{t('comments')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length === 0 ? (
              <tr className="no-results"><td colSpan={6}>{t('no_test_results_found')}</td></tr>
            ) : filteredResults.map(r => (
              <tr key={r.id}>
                <td>{r.patientName}</td>
                <td>{r.testType}</td>
                <td>{r.result}</td>
                <td>{getStatusBadge(r.status)}</td>
                <td>{r.comments || '-'}</td>
                <td className="action-buttons">
                  {r.status === 'Awaiting Approval' ? (
                    <>
                      <button className="btn-approve" onClick={() => handleApprove(r.id)}>{t('approve')}</button>
                      <button className="btn-reject" onClick={() => setSelectedId(r.id)}>{t('reject')}</button>
                    </>
                  ) : (
                    <button className="btn-download" onClick={() => handleDownloadSingle(r)}>
                      <FaDownload /> {t('download')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection panel */}
      {selectedId && (
        <div className="rejection-panel">
          <h3>{t('enter_rejection_reason')}</h3>
          <textarea value={comment} onChange={e => setComment(e.target.value)} />
          <div className="rejection-actions">
            <button className="btn-submit-reject" onClick={() => handleReject(selectedId)}>{t('submit_rejection')}</button>
            <button className="btn-cancel" onClick={() => { setSelectedId(null); setComment(''); }}>{t('cancel')}</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TestResults;
