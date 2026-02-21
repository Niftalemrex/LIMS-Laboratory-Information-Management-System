import React, { useState, useCallback, useEffect } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './ReceiptsPrinting.css';

interface Receipt {
  id: string;
  amount: number;
  date: string;
  patientName: string;
  patientId: string;
  paymentMethod: 'Cash' | 'Credit Card' | 'Insurance' | 'Bank Transfer';
  printed: boolean;
  printedBy?: string;
  printedAt?: string;
  services: string[];
}

const ReceiptsPrinting: React.FC = () => {
  const { t } = useAppSettings();
  const [receipts, setReceipts] = useState<Receipt[]>([
    { 
      id: '1', 
      amount: 150, 
      date: '2023-05-15', 
      patientName: 'John Doe', 
      patientId: 'P1001',
      paymentMethod: 'Credit Card',
      printed: false,
      services: ['Consultation', 'Blood Test']
    },
    { 
      id: '2', 
      amount: 200, 
      date: '2023-05-16', 
      patientName: 'Jane Smith', 
      patientId: 'P1002',
      paymentMethod: 'Insurance',
      printed: true,
      printedBy: 'Admin User',
      printedAt: '2023-05-16 14:30',
      services: ['X-Ray', 'ECG']
    },
    { 
      id: '3', 
      amount: 75, 
      date: '2023-05-17', 
      patientName: 'Robert Johnson', 
      patientId: 'P1003',
      paymentMethod: 'Cash',
      printed: false,
      services: ['Follow-up Visit']
    },
  ]);

  const [filters, setFilters] = useState({
    status: 'pending' as 'all' | 'printed' | 'pending',
    search: '',
    paymentMethod: 'all' as 'all' | Receipt['paymentMethod']
  });

  const [sortConfig, setSortConfig] = useState<{key: keyof Receipt; direction: 'asc' | 'desc'} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const requestSort = useCallback((key: keyof Receipt) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const sortedReceipts = useCallback(() => {
    if (!sortConfig) return receipts;
    
    return [...receipts].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [receipts, sortConfig]);

  const filteredReceipts = sortedReceipts().filter(receipt => {
    const matchesStatus = 
      filters.status === 'all' || 
      (filters.status === 'printed' && receipt.printed) || 
      (filters.status === 'pending' && !receipt.printed);
    
    const matchesPaymentMethod = 
      filters.paymentMethod === 'all' || 
      receipt.paymentMethod === filters.paymentMethod;
    
    const matchesSearch = 
      receipt.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
      receipt.patientId.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesPaymentMethod && matchesSearch;
  });

  const handlePrint = useCallback((id: string) => {
    const printedAt = new Date().toISOString();
    setReceipts(prev => prev.map(receipt =>
      receipt.id === id ? { 
        ...receipt, 
        printed: true,
        printedBy: t('current_user'), // Replace with actual user from auth context
        printedAt: printedAt
      } : receipt
    ));
    // In a real app, you would call your print API here
    console.log(`Printing receipt ${id} at ${printedAt}`);
  }, [t]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return t('na');
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIndicator = (key: keyof Receipt) => {
    if (!sortConfig || sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const printAllPending = useCallback(() => {
    const pendingReceipts = receipts.filter(r => !r.printed);
    if (pendingReceipts.length === 0) return;
    
    if (window.confirm(t('print_pending_confirmation', { count: pendingReceipts.length }))) {
      const printedAt = new Date().toISOString();
      setReceipts(prev => prev.map(receipt =>
        !receipt.printed ? { 
          ...receipt, 
          printed: true,
          printedBy: t('current_user'),
          printedAt: printedAt
        } : receipt
      ));
      // In a real app, you would call your batch print API here
      console.log(`Printing ${pendingReceipts.length} receipts at ${printedAt}`);
    }
  }, [receipts, t]);

  return (
    <div className="receipts-dashboard">
      <header className="dashboard-header">
        <h1>{t('receipt_management')}</h1>
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder={t('search_patients_or_ids')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
              aria-label={t('search_receipts')}
            />
          </div>
          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="status-filter"
              aria-label={t('filter_by_status')}
            >
              <option value="all">{t('all_receipts')}</option>
              <option value="printed">{t('printed')}</option>
              <option value="pending">{t('pending')}</option>
            </select>
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="payment-filter"
              aria-label={t('filter_by_payment_method')}
            >
              <option value="all">{t('all_payment_methods')}</option>
              <option value="Cash">{t('cash')}</option>
              <option value="Credit Card">{t('credit_card')}</option>
              <option value="Insurance">{t('insurance')}</option>
              <option value="Bank Transfer">{t('bank_transfer')}</option>
            </select>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>{t('loading_receipt_data')}</p>
          </div>
        ) : (
          <>
            <div className="summary-bar">
              <div className="summary-item">
                <div className="summary-value">${receipts.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}</div>
                <div className="summary-label">{t('total_amount')}</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{receipts.filter(r => !r.printed).length}</div>
                <div className="summary-label">{t('pending_print')}</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{receipts.filter(r => r.printed).length}</div>
                <div className="summary-label">{t('printed')}</div>
              </div>
              {receipts.some(r => !r.printed) && (
                <button 
                  onClick={printAllPending}
                  className="print-all-button"
                >
                  {t('print_all_pending')}
                </button>
              )}
            </div>

            <div className="receipts-card">
              <div className="table-container">
                <table className="receipts-table">
                  <thead>
                    <tr>
                      <th onClick={() => requestSort('date')}>
                        {t('date')} {getSortIndicator('date')}
                      </th>
                      <th onClick={() => requestSort('patientName')}>
                        {t('patient')} {getSortIndicator('patientName')}
                      </th>
                      <th onClick={() => requestSort('amount')}>
                        {t('amount')} {getSortIndicator('amount')}
                      </th>
                      <th>{t('payment_method')}</th>
                      <th>{t('services')}</th>
                      <th>{t('status')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.length > 0 ? (
                      filteredReceipts.map(receipt => (
                        <tr 
                          key={receipt.id} 
                          className={receipt.printed ? 'printed' : 'pending'}
                          onClick={() => setSelectedReceipt(receipt)}
                        >
                          <td>{formatDate(receipt.date)}</td>
                          <td>
                            <div className="patient-info">
                              <div className="patient-name">{receipt.patientName}</div>
                              <div className="patient-id">ID: {receipt.patientId}</div>
                            </div>
                          </td>
                          <td>
                            <div className="amount">${receipt.amount.toFixed(2)}</div>
                          </td>
                          <td>
                            <span className={`payment-method ${receipt.paymentMethod.toLowerCase().replace(' ', '-')}`}>
                              {t(receipt.paymentMethod.toLowerCase().replace(' ', '_'))}
                            </span>
                          </td>
                          <td>
                            <div className="services-list">
                              {receipt.services.slice(0, 2).map((service, i) => (
                                <span key={i} className="service-tag">{service}</span>
                              ))}
                              {receipt.services.length > 2 && (
                                <span className="more-tag">+{receipt.services.length - 2} {t('more')}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${receipt.printed ? 'printed' : 'pending'}`}>
                              {receipt.printed ? t('printed') : t('pending')}
                              {receipt.printed && (
                                <div className="print-details">
                                  {receipt.printedBy} {t('at')} {formatDateTime(receipt.printedAt)}
                                </div>
                              )}
                            </span>
                          </td>
                          <td className="action-buttons">
                            {!receipt.printed && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrint(receipt.id);
                                }}
                                className="print-button"
                              >
                                {t('print')}
                              </button>
                            )}
                            <button 
                              className="details-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReceipt(receipt);
                              }}
                            >
                              {t('details')}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-results">
                        <td colSpan={7}>
                          {t('no_receipts_found')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedReceipt && (
        <div className="receipt-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('receipt_details')}</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedReceipt(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">{t('patient')}:</span>
                <span className="detail-value">{selectedReceipt.patientName} (ID: {selectedReceipt.patientId})</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('date')}:</span>
                <span className="detail-value">{formatDate(selectedReceipt.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('amount')}:</span>
                <span className="detail-value">${selectedReceipt.amount.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('payment_method')}:</span>
                <span className="detail-value">{t(selectedReceipt.paymentMethod.toLowerCase().replace(' ', '_'))}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('status')}:</span>
                <span className="detail-value">
                  <span className={`status-badge ${selectedReceipt.printed ? 'printed' : 'pending'}`}>
                    {selectedReceipt.printed ? t('printed') : t('pending')}
                  </span>
                </span>
              </div>
              {selectedReceipt.printed && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">{t('printed_by')}:</span>
                    <span className="detail-value">{selectedReceipt.printedBy}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('printed_at')}:</span>
                    <span className="detail-value">{formatDateTime(selectedReceipt.printedAt)}</span>
                  </div>
                </>
              )}
              <div className="services-section">
                <h3>{t('services')}</h3>
                <ul className="services-list">
                  {selectedReceipt.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              {!selectedReceipt.printed && (
                <button 
                  onClick={() => {
                    handlePrint(selectedReceipt.id);
                    setSelectedReceipt(null);
                  }}
                  className="print-button"
                >
                  {t('print_receipt')}
                </button>
              )}
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="close-modal-button"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsPrinting;