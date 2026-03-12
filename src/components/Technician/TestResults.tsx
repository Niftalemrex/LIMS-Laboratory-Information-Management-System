import React, { useState, useRef, useEffect } from 'react';
import { 
  FiUpload, FiPlus, FiAlertCircle, FiCheckCircle,
  FiDownload, FiPrinter, FiSearch, FiEye, FiPaperclip
} from 'react-icons/fi';
import './TestResults.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

type TestResultStatus = 'Normal' | 'Abnormal' | 'Critical';
type TestPriority = 'Routine' | 'Urgent' | 'STAT';

interface TestResult {
  id: string;
  testName: string;
  resultValue: string;
  unit: string;
  normalRange: string;
  status: TestResultStatus;
  priority: TestPriority;
  attachments: File[];
  notes: string;
  date: string; // must be string
}

interface Sample {
  id: string;
  patient: string;
  test: string;
  status: 'Received' | 'Processing' | 'Completed' | 'Pending' | 'Rejected';
  collectionDate: string;
  priority: TestPriority;
  assignedTo: string;
}

const initialResults: TestResult[] = [
  { id: 'TR-1001', testName: 'Hemoglobin', resultValue: '13.5', unit: 'g/dL', normalRange: '12-16', status: 'Normal', priority: 'Routine', attachments: [], notes: '', date: '2023-06-15' },
  { id: 'TR-1002', testName: 'White Blood Cells', resultValue: '11.2', unit: '10^3/μL', normalRange: '4-11', status: 'Abnormal', priority: 'Urgent', attachments: [], notes: 'follow_up_required', date: '2023-06-15' },
  { id: 'TR-1003', testName: 'Platelets', resultValue: '450', unit: '10^3/μL', normalRange: '150-450', status: 'Critical', priority: 'STAT', attachments: [], notes: 'immediate_attention_needed', date: '2023-06-14' }
];

const STORAGE_KEY = 'lab_test_results';
const SAMPLES_KEY = 'lab_samples_data';

const TestResults: React.FC = () => {
  const { t } = useAppSettings();
  const [testName, setTestName] = useState('');
  const [resultValue, setResultValue] = useState('');
  const [unit, setUnit] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [priority, setPriority] = useState<TestPriority>('Routine');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const [results, setResults] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialResults;
  });

  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TestResultStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TestPriority | 'All'>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge samples from localStorage
  useEffect(() => {
    const storedSamples = localStorage.getItem(SAMPLES_KEY);
    if (storedSamples) {
      try {
        const samples: Sample[] = JSON.parse(storedSamples);
        const mappedResults: TestResult[] = samples
          .filter(sample => sample.test) // ensure test property exists
          .map(sample => ({
            id: sample.id,
            testName: sample.test,
            resultValue: '',
            unit: '',
            normalRange: '',
            status: 'Normal',
            priority: sample.priority,
            attachments: [],
            notes: '',
            date:  ''
          }));

        setResults(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const newResults = mappedResults.filter(r => !existingIds.has(r.id));
          const merged = [...prev, ...newResults];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      } catch (err) {
        console.error('Error parsing samples from localStorage', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }, [results]);

  const determineStatus = (value: string, range: string): TestResultStatus => {
    if (!value || !range) return 'Normal';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Normal';
    const parts = range.split('-');
    if (parts.length !== 2) return 'Normal';
    
  
    return 'Normal';
  };

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) { setError(t('test_name_required')); return; }
    if (!resultValue.trim()) { setError(t('result_value_required')); return; }
    if (!unit.trim()) { setError(t('unit_required')); return; }
    if (!normalRange.trim()) { setError(t('normal_range_required')); return; }

    const status = determineStatus(resultValue, normalRange);
    // Ensure date is a string – split always returns an array of at least 1 element
    const datePart = new Date().toISOString().split('T')[0] ?? new Date().toISOString().split(' ')[0] ?? '';

    const newResult: TestResult = {
      id: `TR-${Date.now()}`,
      testName: testName.trim(),
      resultValue: resultValue.trim(),
      unit: unit.trim(),
      normalRange: normalRange.trim(),
      status,
      priority,
      attachments,
      notes: notes.trim(),
      date: datePart,
    };

    setResults(prev => [newResult, ...prev]);
    resetForm();
    setError(null);
  };

  const resetForm = () => {
    setTestName('');
    setResultValue('');
    setUnit('');
    setNormalRange('');
    setPriority('Routine');
    setNotes('');
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredResults = results.filter(result => {
    const matchesSearch =
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || result.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || result.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // ===== CSV Download Function =====
  const handleDownloadAll = () => {
    if (filteredResults.length === 0) {
      alert(t('no_results_to_export'));
      return;
    }
    const csvHeader = [
      'ID','Test Name','Result Value','Unit','Normal Range','Status','Priority','Notes','Date'
    ].join(',');
    const csvRows = filteredResults.map(r =>
      [
        `"${r.id}"`,
        `"${r.testName}"`,
        `"${r.resultValue}"`,
        `"${r.unit}"`,
        `"${r.normalRange}"`,
        `"${r.status}"`,
        `"${r.priority}"`,
        `"${r.notes}"`,
        `"${r.date}"`
      ].join(',')
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewDetails = (result: TestResult) => {
    alert(`${t('viewing_details')}: ${result.testName}`);
  };

  const handleDownloadAttachments = (result: TestResult) => {
    if (result.attachments.length === 0) return;
    result.attachments.forEach(file => {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="test-results">
      <header className="content-header">
        <div>
          <h1 className="dashboard-title">{t('test_results_management')}</h1>
          <p className="dashboard-subtitle">{t('test_results_subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleDownloadAll}>
            <FiDownload className="icon" /> {t('export')}
          </button>
          <button className="btn btn-outline" onClick={handlePrint}>
            <FiPrinter className="icon" /> {t('print')}
          </button>
        </div>
      </header>

      <div className="filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('search_tests')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="status-filter">{t('status')}</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TestResultStatus | 'All')}
              className="filter-select"
            >
              <option value="All">{t('all_statuses')}</option>
              <option value="Normal">{t('normal')}</option>
              <option value="Abnormal">{t('abnormal')}</option>
              <option value="Critical">{t('critical')}</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="priority-filter">{t('priority')}</label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TestPriority | 'All')}
              className="filter-select"
            >
              <option value="All">{t('all_priorities')}</option>
              <option value="Routine">{t('routine')}</option>
              <option value="Urgent">{t('urgent')}</option>
              <option value="STAT">{t('stat')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <form className="results-form" onSubmit={handleSubmit}>
          <h2 className="form-title">{t('add_new_test_result')}</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="testName">{t('test_name')} *</label>
              <input
                id="testName"
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder={t('test_name_placeholder')}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="resultValue">{t('result_value')} *</label>
              <input
                id="resultValue"
                type="text"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                placeholder={t('result_value_placeholder')}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">{t('unit')} *</label>
              <input
                id="unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t('unit_placeholder')}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="normalRange">{t('normal_range')} *</label>
              <input
                id="normalRange"
                type="text"
                value={normalRange}
                onChange={(e) => setNormalRange(e.target.value)}
                placeholder={t('normal_range_placeholder')}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">{t('priority')}</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TestPriority)}
                className="form-select"
              >
                <option value="Routine">{t('routine')}</option>
                <option value="Urgent">{t('urgent')}</option>
                <option value="STAT">{t('stat')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">{t('notes')}</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notes_placeholder')}
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="attachments">{t('attachments')}</label>
              <div className="file-upload">
                <input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleAttachFiles}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUpload className="icon" /> {t('choose_files')}
                </button>
                {attachments.length > 0 && (
                  <span className="file-count">{attachments.length} {t('files_selected')}</span>
                )}
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              {t('clear')}
            </button>
            <button type="submit" className="btn btn-primary">
              <FiPlus className="icon" /> {t('add_result')}
            </button>
          </div>
        </form>

        <div className="results-display">
          <div className="results-summary">
            <div className="summary-card">
              <span className="summary-value">{results.length}</span>
              <span className="summary-label">{t('total_tests')}</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">
                {results.filter(r => r.status === 'Abnormal' || r.status === 'Critical').length}
              </span>
              <span className="summary-label">{t('abnormal_results')}</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">
                {results.filter(r => r.priority === 'STAT').length}
              </span>
              <span className="summary-label">{t('stat_priority')}</span>
            </div>
          </div>

          <div className="results-table-container">
            {filteredResults.length === 0 ? (
              <div className="empty-state">
                <p>{t('no_results_match')}</p>
              </div>
            ) : (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>{t('id')}</th>
                    <th>{t('test_name')}</th>
                    <th>{t('result')}</th>
                    <th>{t('status')}</th>
                    <th>{t('priority')}</th>
                    <th>{t('date')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.id} className={`status-${result.status.toLowerCase()}`}>
                      <td>{result.id}</td>
                      <td>
                        <div className="test-name">{result.testName}</div>
                        <div className="test-range">{result.normalRange} {result.unit}</div>
                      </td>
                      <td>
                        <div className="result-value">{result.resultValue}</div>
                        <div className="result-unit">{result.unit}</div>
                      </td>
                      <td>
                        <div className={`status-badge ${result.status.toLowerCase()}`}>
                          {result.status === 'Normal' ? <FiCheckCircle /> : <FiAlertCircle />}
                          {t(result.status.toLowerCase())}
                        </div>
                      </td>
                      <td>
                        <div className={`priority-badge ${result.priority.toLowerCase()}`}>
                          {t(result.priority.toLowerCase())}
                        </div>
                      </td>
                      <td>{result.date}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-icon"
                            title={t('view_details')}
                            onClick={() => handleViewDetails(result)}
                          >
                            <FiEye />
                          </button>
                          <button 
                            className="btn btn-icon"
                            title={t('download_attachments')}
                            disabled={result.attachments.length === 0}
                            onClick={() => handleDownloadAttachments(result)}
                          >
                            <FiPaperclip />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;