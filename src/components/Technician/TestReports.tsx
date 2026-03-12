import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  FiDownload, FiPrinter, FiSearch, FiAlertTriangle, FiCheckCircle, FiXCircle,
  FiClock, FiEye, FiEdit, FiTrash2, FiBarChart2, 
} from 'react-icons/fi';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './TestReports.css';

type TestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
type TestPriority = 'Routine' | 'Urgent' | 'STAT';
type TestCategory = 'Hematology' | 'Biochemistry' | 'Immunology' | 'Microbiology' | 'Radiology' | 'Pathology';

interface TestReport {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  category: TestCategory;
  orderedBy: string;
  orderedDate: string;
  dueDate: string;
  status: TestStatus;
  priority: TestPriority;
  result?: string;
  normalRange?: string;
  units?: string;
  technician?: string;
  completedDate?: string;
  notes?: string;
  attachments: number;
}

interface Filters {
  status: TestStatus | 'All';
  priority: TestPriority | 'All';
  category: TestCategory | 'All';
  search: string;
}

const API_URL = 'http://localhost:8000/api/test-reports/';

const TestReports: React.FC = () => {
  const { t } = useAppSettings();

  const [reports, setReports] = useState<TestReport[]>([]);
  const [filters, setFilters] = useState<Filters>({ status: 'All', priority: 'All', category: 'All', search: '' });
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TestReport; direction: 'asc' | 'desc' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ------------------ Fetch Reports ------------------
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data: TestReport[] = await res.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        alert(t('failed_to_load_reports') || 'Failed to load reports.');
      }
    };
    fetchReports();
  }, [t]);

  // ------------------ Filter ------------------
  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // ------------------ Sort ------------------
  const handleSort = useCallback((key: keyof TestReport) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // ------------------ Sorted & Filtered Reports ------------------
  const sortedAndFilteredReports = useMemo(() => {
    let filtered = reports.filter(report => {
      const matchesStatus = filters.status === 'All' || report.status === filters.status;
      const matchesPriority = filters.priority === 'All' || report.priority === filters.priority;
      const matchesCategory = filters.category === 'All' || report.category === filters.category;
      const matchesSearch =
        report.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.testName.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.patientId.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [reports, filters, sortConfig]);

  // ------------------ Statistics ------------------
  const statistics = useMemo(() => ({
    total: reports.length,
    completed: reports.filter(r => r.status === 'Completed').length,
    inProgress: reports.filter(r => r.status === 'In Progress').length,
    pending: reports.filter(r => r.status === 'Pending').length,
    cancelled: reports.filter(r => r.status === 'Cancelled').length
  }), [reports]);

  // ------------------ Export ------------------
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // simulate export
    setIsExporting(false);
    alert(t('reports_exported_successfully') || 'Reports exported successfully.');
  }, [t]);

  const handlePrint = useCallback(() => window.print(), []);

  const handleDeleteReport = useCallback(async (id: string) => {
    if (!window.confirm(t('confirm_delete_test_report') || 'Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete report');
      setReports(prev => prev.filter(r => r.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
    } catch (err) {
      console.error(err);
      alert(t('failed_to_delete_report') || 'Failed to delete report.');
    }
  }, [selectedReport, t]);

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'Completed': return <FiCheckCircle />;
      case 'In Progress': return <FiClock />;
      case 'Pending': return <FiAlertTriangle />;
      case 'Cancelled': return <FiXCircle />;
    }
  };

  const getPriorityColor = (priority: TestPriority) => {
    switch (priority) {
      case 'STAT': return 'priority-stat';
      case 'Urgent': return 'priority-urgent';
      case 'Routine': return 'priority-routine';
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="test-reports">
      {/* Header */}
      <header className="reports-header">
        <div className="header-content">
          <h1>{t('test_reports')}</h1>
          <p>{t('manage_review_lab_results')}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleExport} disabled={isExporting}>
            <FiDownload /> {isExporting ? t('exporting') : t('export_reports')}
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <FiPrinter /> {t('print')}
          </button>
        </div>
      </header>

      {/* Statistics */}
      <div className="reports-dashboard">
        <div className="stats-grid">
          {['total','completed','inProgress','pending','cancelled'].map(stat => (
            <div key={stat} className="stat-card">
              <div className={`stat-icon ${stat}`}>
                {stat === 'total' && <FiBarChart2 />}
                {stat === 'completed' && <FiCheckCircle />}
                {stat === 'inProgress' && <FiClock />}
                {stat === 'pending' && <FiAlertTriangle />}
                {stat === 'cancelled' && <FiXCircle />}
              </div>
              <div className="stat-content">
                <span className="stat-value">{statistics[stat as keyof typeof statistics]}</span>
                <span className="stat-label">{t(stat)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder={t('search_reports_patients_tests')}
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            {['status','priority','category'].map(f => (
              <select
                key={f}
                value={filters[f as keyof Filters]}
                onChange={e => handleFilterChange(f as keyof Filters, e.target.value)}
                className="filter-select"
              >
                <option value="All">{t(`all_${f}s`)}</option>
                {(f === 'status' ? ['Pending','In Progress','Completed','Cancelled'] :
                 f === 'priority' ? ['Routine','Urgent','STAT'] :
                 ['Hematology','Biochemistry','Immunology','Microbiology','Radiology','Pathology']
                ).map(v => <option key={v} value={v}>{t(v.toLowerCase().replace(' ','_'))}</option>)}
              </select>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                {['id','patientName','testName','category','orderedDate','dueDate','status','priority'].map(col => (
                  <th key={col} onClick={() => handleSort(col as keyof TestReport)}>{t(col)}</th>
                ))}
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredReports.map(report => (
                <tr key={report.id} className={getPriorityColor(report.priority)}>
                  <td>{report.id}</td>
                  <td>
                    <div className="patient-info">
                      <div className="patient-name">{report.patientName}</div>
                      <div className="patient-id">ID: {report.patientId}</div>
                    </div>
                  </td>
                  <td>{report.testName}</td>
                  <td>{t(report.category.toLowerCase())}</td>
                  <td>{formatDate(report.orderedDate)}</td>
                  <td>{formatDate(report.dueDate)}</td>
                  <td>
                    <span className={`status-badge status-${report.status.toLowerCase().replace(' ','-')}`}>
                      {getStatusIcon(report.status)} {t(report.status.toLowerCase().replace(' ','_'))}
                    </span>
                  </td>
                  <td>{t(report.priority.toLowerCase())}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon view" onClick={() => setSelectedReport(report)}><FiEye /></button>
                      <button className="btn-icon edit"><FiEdit /></button>
                      <button className="btn-icon delete" onClick={() => handleDeleteReport(report.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedAndFilteredReports.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center' }}>No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('test_report_details')}</h2>
              <button className="close-button" onClick={() => setSelectedReport(null)}><FiXCircle /></button>
            </div>
            <div className="modal-body">
              {/* Details here */}
              <p><strong>Patient:</strong> {selectedReport.patientName} (ID: {selectedReport.patientId})</p>
              <p><strong>Test:</strong> {selectedReport.testName}</p>
              <p><strong>Category:</strong> {selectedReport.category}</p>
              <p><strong>Status:</strong> {selectedReport.status}</p>
              <p><strong>Priority:</strong> {selectedReport.priority}</p>
              <p><strong>Ordered By:</strong> {selectedReport.orderedBy}</p>
              <p><strong>Ordered Date:</strong> {formatDate(selectedReport.orderedDate)}</p>
              <p><strong>Due Date:</strong> {formatDate(selectedReport.dueDate)}</p>
              {selectedReport.completedDate && <p><strong>Completed Date:</strong> {formatDate(selectedReport.completedDate)}</p>}
              {selectedReport.result && <p><strong>Result:</strong> {selectedReport.result}</p>}
              {selectedReport.notes && <p><strong>Notes:</strong> {selectedReport.notes}</p>}
              {selectedReport.attachments > 0 && <p><strong>Attachments:</strong> {selectedReport.attachments}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestReports;
