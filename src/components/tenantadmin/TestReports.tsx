import React, { useState, useCallback, useEffect } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './TestReports.css';

interface TestReport {
  id: string;
  patientName: string;
  patientId: string;
  testName: string;
  testCode: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'In Progress';
  result?: string;
  labTechnician?: string;
  orderedBy: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
}

const TestReports: React.FC = () => {
  const { t } = useAppSettings();
  const [reports, setReports] = useState<TestReport[]>([
    { 
      id: '1', 
      patientName: 'John Smith', 
      patientId: 'P1001',
      testName: 'Complete Blood Count', 
      testCode: 'CBC',
      date: '2023-05-10', 
      status: 'Completed', 
      result: 'Normal',
      labTechnician: 'Lisa Wong',
      orderedBy: 'Dr. Sarah Johnson',
      priority: 'Routine'
    },
    { 
      id: '2', 
      patientName: 'Emily Davis', 
      patientId: 'P1002',
      testName: 'Chest X-Ray', 
      testCode: 'CXR',
      date: '2023-05-12', 
      status: 'In Progress',
      labTechnician: 'Michael Chen',
      orderedBy: 'Dr. Robert Brown',
      priority: 'Urgent'
    },
    { 
      id: '3', 
      patientName: 'Michael Johnson', 
      patientId: 'P1003',
      testName: 'Lipid Panel', 
      testCode: 'LIPID',
      date: '2023-05-15', 
      status: 'Pending',
      orderedBy: 'Dr. Sarah Johnson',
      priority: 'Routine'
    },
  ]);

  const [filters, setFilters] = useState({
    status: 'All' as 'All' | TestReport['status'],
    priority: 'All' as 'All' | TestReport['priority'],
    search: ''
  });

  const [sortConfig, setSortConfig] = useState<{key: keyof TestReport; direction: 'asc' | 'desc'} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const requestSort = useCallback((key: keyof TestReport) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const sortedReports = useCallback(() => {
    if (!sortConfig) return reports;
    
    return [...reports].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [reports, sortConfig]);

  const filteredReports = sortedReports().filter(report => {
    const matchesStatus = filters.status === 'All' || report.status === filters.status;
    const matchesPriority = filters.priority === 'All' || report.priority === filters.priority;
    const matchesSearch = 
      report.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.testName.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.testCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.patientId.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const updateStatus = useCallback((id: string, newStatus: TestReport['status']) => {
    setReports(prev => prev.map(report =>
      report.id === id ? { 
        ...report, 
        status: newStatus,
        ...(newStatus === 'Completed' && !report.result ? { result: t('pending_review') } : {})
      } : report
    ));
  }, [t]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSortIndicator = (key: keyof TestReport) => {
    if (!sortConfig || sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getStatusActions = (report: TestReport) => {
    switch (report.status) {
      case 'Pending':
        return (
          <>
            <button 
              onClick={() => updateStatus(report.id, 'In Progress')}
              className="status-button progress-button"
            >
              {t('start_test')}
            </button>
            <button 
              onClick={() => updateStatus(report.id, 'Cancelled')}
              className="status-button cancel-button"
            >
              {t('cancel')}
            </button>
          </>
        );
      case 'In Progress':
        return (
          <>
            <button 
              onClick={() => updateStatus(report.id, 'Completed')}
              className="status-button complete-button"
            >
              {t('complete')}
            </button>
            <button 
              onClick={() => updateStatus(report.id, 'Pending')}
              className="status-button hold-button"
            >
              {t('put_on_hold')}
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="test-reports-dashboard">
      <header className="dashboard-header">
        <h1>{t('laboratory_test_reports')}</h1>
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder={t('search_tests_patients')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
              aria-label={t('search_test_reports')}
            />
          </div>
          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="status-filter"
              aria-label={t('filter_by_status')}
            >
              <option value="All">{t('all_statuses')}</option>
              <option value="Pending">{t('pending')}</option>
              <option value="In Progress">{t('in_progress')}</option>
              <option value="Completed">{t('completed')}</option>
              <option value="Cancelled">{t('cancelled')}</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="priority-filter"
              aria-label={t('filter_by_priority')}
            >
              <option value="All">{t('all_priorities')}</option>
              <option value="Routine">{t('routine')}</option>
              <option value="Urgent">{t('urgent')}</option>
              <option value="STAT">{t('stat')}</option>
            </select>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>{t('loading_test_reports')}</p>
          </div>
        ) : (
          <div className="reports-card">
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('patientName')}>
                      {t('patient')} {getSortIndicator('patientName')}
                    </th>
                    <th onClick={() => requestSort('testName')}>
                      {t('test')} {getSortIndicator('testName')}
                    </th>
                    <th onClick={() => requestSort('date')}>
                      {t('date')} {getSortIndicator('date')}
                    </th>
                    <th onClick={() => requestSort('priority')}>
                      {t('priority')} {getSortIndicator('priority')}
                    </th>
                    <th>{t('status')}</th>
                    <th>{t('result')}</th>
                    <th>{t('ordered_by')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map(report => (
                      <tr key={report.id} className={`status-${report.status.toLowerCase().replace(' ', '-')}`}>
                        <td>
                          <div className="patient-info">
                            <div className="patient-name">{report.patientName}</div>
                            <div className="patient-id">ID: {report.patientId}</div>
                          </div>
                        </td>
                        <td>
                          <div className="test-info">
                            <div className="test-name">{report.testName}</div>
                            <div className="test-code">{report.testCode}</div>
                          </div>
                        </td>
                        <td>
                          {formatDate(report.date)}
                        </td>
                        <td>
                          <span className={`priority-badge ${report.priority.toLowerCase()}`}>
                            {report.priority}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge">
                            {report.status}
                            {report.labTechnician && (
                              <div className="technician">{t('tech')}: {report.labTechnician}</div>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className={`result ${!report.result ? 'no-result' : ''}`}>
                            {report.result || t('na')}
                          </span>
                        </td>
                        <td>
                          {report.orderedBy}
                        </td>
                        <td className="action-buttons">
                          {getStatusActions(report)}
                          <button className="view-button">
                            <span role="img" aria-label={t('view')}>🔍</span> {t('details')}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-results">
                      <td colSpan={8}>
                        {t('no_test_reports_found')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="summary-stats">
              <div className="stat-card">
                <div className="stat-value">{reports.filter(r => r.status === 'Pending').length}</div>
                <div className="stat-label">{t('pending_tests')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{reports.filter(r => r.status === 'In Progress').length}</div>
                <div className="stat-label">{t('in_progress')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{reports.filter(r => r.status === 'Completed').length}</div>
                <div className="stat-label">{t('completed')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestReports;