import React, { useState, useCallback } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './Accounting.css';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Insurance';
  status: 'Completed' | 'Pending' | 'Rejected';
  reference?: string;
  patientId?: string;
  patientName?: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeByCategory: { [key: string]: number };
  expensesByCategory: { [key: string]: number };
}

const Accounting: React.FC = () => {
  const { t } = useAppSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: '1', 
      date: '2023-05-01', 
      description: 'Consultation Fees', 
      amount: 1200, 
      type: 'Income',
      category: 'Consultation',
      paymentMethod: 'Credit Card',
      status: 'Completed',
      patientId: 'P1001',
      patientName: 'John Smith'
    },
    { 
      id: '2', 
      date: '2023-05-02', 
      description: 'Medical Supplies', 
      amount: 350, 
      type: 'Expense',
      category: 'Supplies',
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      reference: 'INV-00234'
    },
    { 
      id: '3', 
      date: '2023-05-03', 
      description: 'Lab Tests', 
      amount: 450, 
      type: 'Income',
      category: 'Laboratory',
      paymentMethod: 'Insurance',
      status: 'Pending',
      patientId: 'P1002',
      patientName: 'Emily Davis'
    },
    { 
      id: '4', 
      date: '2023-05-04', 
      description: 'Equipment Maintenance', 
      amount: 275, 
      type: 'Expense',
      category: 'Maintenance',
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      reference: 'MNT-001'
    }
  ]);

  const [filters, setFilters] = useState({
    type: 'All' as 'All' | 'Income' | 'Expense',
    status: 'All' as 'All' | Transaction['status'],
    category: 'All' as 'All' | string,
    dateRange: 'month' as 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all',
    search: ''
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'status'>>({
    date: new Date().toISOString().split('T')[0] ?? '',
    description: '',
    amount: 0,
    type: 'Income',
    category: '',
    paymentMethod: 'Cash'
  });

  const categories = {
    Income: ['Consultation', 'Laboratory', 'Procedures', 'Medication', 'Other Income'],
    Expense: ['Supplies', 'Salaries', 'Rent', 'Utilities', 'Maintenance', 'Other Expenses']
  };

  // Calculate financial summary
  const financialSummary: FinancialSummary = React.useMemo(() => {
    const summary: FinancialSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      incomeByCategory: {},
      expensesByCategory: {}
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'Income') {
        summary.totalIncome += transaction.amount;
        summary.incomeByCategory[transaction.category] = 
          (summary.incomeByCategory[transaction.category] || 0) + transaction.amount;
      } else {
        summary.totalExpenses += transaction.amount;
        summary.expensesByCategory[transaction.category] = 
          (summary.expensesByCategory[transaction.category] || 0) + transaction.amount;
      }
    });

    summary.netBalance = summary.totalIncome - summary.totalExpenses;
    return summary;
  }, [transactions]);

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  // Filtered transactions (no sorting)
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filters.type === 'All' || transaction.type === filters.type;
    const matchesStatus = filters.status === 'All' || transaction.status === filters.status;
    const matchesCategory = filters.category === 'All' || transaction.category === filters.category;

    const searchLower = filters.search.toLowerCase();
    const descriptionMatch = transaction.description.toLowerCase().includes(searchLower);
    const patientNameMatch = transaction.patientName?.toLowerCase().includes(searchLower) ?? false;
    const referenceMatch = transaction.reference?.toLowerCase().includes(searchLower) ?? false;
    const matchesSearch = descriptionMatch || patientNameMatch || referenceMatch;

    return matchesType && matchesStatus && matchesCategory && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddTransaction = () => {
    const newId = (transactions.length + 1).toString();
    setTransactions(prev => [
      ...prev,
      {
        ...newTransaction,
        id: newId,
        status: 'Completed'
      }
    ]);
    setIsAddingTransaction(false);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0] ?? '',
      description: '',
      amount: 0,
      type: 'Income',
      category: '',
      paymentMethod: 'Cash'
    });
  };

  return (
    <div className="accounting-dashboard">
      <header className="dashboard-header">
        <h1>{t('financial_management')}</h1>
        <div className="controls">
          <input
            type="text"
            placeholder={t('search_transactions')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
            aria-label={t('search_transactions')}
          />
          <div className="filter-group">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="type-filter"
              aria-label={t('filter_by_type')}
            >
              <option value="All">{t('all_types')}</option>
              <option value="Income">{t('income')}</option>
              <option value="Expense">{t('expenses')}</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="status-filter"
              aria-label={t('filter_by_status')}
            >
              <option value="All">{t('all_statuses')}</option>
              <option value="Completed">{t('completed')}</option>
              <option value="Pending">{t('pending')}</option>
              <option value="Rejected">{t('rejected')}</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="category-filter"
              aria-label={t('filter_by_category')}
            >
              <option value="All">{t('all_categories')}</option>
              {categories[filters.type === 'Expense' ? 'Expense' : 'Income'].map(category => (
                <option key={category} value={category}>{t(category.toLowerCase().replace(' ', '_'))}</option>
              ))}
            </select>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="date-filter"
              aria-label={t('filter_by_date_range')}
            >
              <option value="day">{t('today')}</option>
              <option value="week">{t('this_week')}</option>
              <option value="month">{t('this_month')}</option>
              <option value="quarter">{t('this_quarter')}</option>
              <option value="year">{t('this_year')}</option>
              <option value="all">{t('all_time')}</option>
            </select>
          </div>
          <button 
            onClick={() => setIsAddingTransaction(true)}
            className="add-button"
          >
            + {t('add_transaction')}
          </button>
        </div>
      </header>

      <div className="financial-overview">
        <div className="summary-cards">
          <div className="summary-card income">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <div className="summary-label">{t('total_income')}</div>
              <div className="summary-value">{formatCurrency(financialSummary.totalIncome)}</div>
            </div>
          </div>
          <div className="summary-card expense">
            <div className="summary-icon">💸</div>
            <div className="summary-content">
              <div className="summary-label">{t('total_expenses')}</div>
              <div className="summary-value">{formatCurrency(financialSummary.totalExpenses)}</div>
            </div>
          </div>
          <div className="summary-card balance">
            <div className="summary-icon">⚖️</div>
            <div className="summary-content">
              <div className="summary-label">{t('net_balance')}</div>
              <div className={`summary-value ${financialSummary.netBalance >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(financialSummary.netBalance)}
              </div>
            </div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-card">
            <h3>{t('income_by_category')}</h3>
            <div className="chart-content">
              {Object.entries(financialSummary.incomeByCategory).map(([category, amount]) => (
                <div key={category} className="chart-item">
                  <div className="chart-label">{t(category.toLowerCase().replace(' ', '_'))}</div>
                  <div className="chart-bar">
                    <div 
                      className="chart-fill income"
                      style={{ width: `${(amount / financialSummary.totalIncome) * 100}%` }}
                    ></div>
                  </div>
                  <div className="chart-value">{formatCurrency(amount)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-card">
            <h3>{t('expenses_by_category')}</h3>
            <div className="chart-content">
              {Object.entries(financialSummary.expensesByCategory).map(([category, amount]) => (
                <div key={category} className="chart-item">
                  <div className="chart-label">{t(category.toLowerCase().replace(' ', '_'))}</div>
                  <div className="chart-bar">
                    <div 
                      className="chart-fill expense"
                      style={{ width: `${(amount / financialSummary.totalExpenses) * 100}%` }}
                    ></div>
                  </div>
                  <div className="chart-value">{formatCurrency(amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('description')}</th>
                <th>{t('patient_reference')}</th>
                <th>{t('category')}</th>
                <th>{t('payment_method')}</th>
                <th>{t('amount')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className={`status-${transaction.status.toLowerCase()}`}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    <div className="description">{transaction.description}</div>
                    {transaction.patientName && (
                      <div className="patient-info">{transaction.patientName}</div>
                    )}
                  </td>
                  <td>
                    {transaction.reference && (
                      <div className="reference">{transaction.reference}</div>
                    )}
                    {transaction.patientId && (
                      <div className="patient-id">ID: {transaction.patientId}</div>
                    )}
                  </td>
                  <td>
                    <span className="category-badge">{t(transaction.category.toLowerCase().replace(' ', '_'))}</span>
                  </td>
                  <td>
                    <span className="payment-method">{t(transaction.paymentMethod.toLowerCase().replace(' ', '_'))}</span>
                  </td>
                  <td className={`amount ${transaction.type.toLowerCase()}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td>
                    <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                      {t(transaction.status.toLowerCase())}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => setSelectedTransaction(transaction)}
                      className="details-button"
                    >
                      {t('view')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddingTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('add_new_transaction')}</h2>
              <button 
                className="close-button"
                onClick={() => setIsAddingTransaction(false)}
                aria-label={t('close_modal')}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>{t('type')}</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as 'Income' | 'Expense'})}
                  >
                    <option value="Income">{t('income')}</option>
                    <option value="Expense">{t('expenses')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('date')}</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t('description')}</label>
                <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder={t('enter_transaction_description')}
                  />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('amount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>{t('category')}</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  >
                    <option value="">{t('select_category')}</option>
                    {categories[newTransaction.type].map(category => (
                      <option key={category} value={category}>{t(category.toLowerCase().replace(' ', '_'))}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('payment_method')}</label>
                <select
                  value={newTransaction.paymentMethod}
                  onChange={(e) => setNewTransaction({...newTransaction, paymentMethod: e.target.value as any})}
                >
                  <option value="Cash">{t('cash')}</option>
                  <option value="Credit Card">{t('credit_card')}</option>
                  <option value="Bank Transfer">{t('bank_transfer')}</option>
                  <option value="Insurance">{t('insurance')}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={handleAddTransaction}
                className="save-button"
                disabled={!newTransaction.description || !newTransaction.category || newTransaction.amount <= 0}
              >
                {t('add_transaction')}
              </button>
              <button 
                onClick={() => setIsAddingTransaction(false)}
                className="cancel-button"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('transaction_details')}</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedTransaction(null)}
                aria-label={t('close_modal')}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>{t('basic_information')}</h3>
                <div className="detail-row">
                  <span className="detail-label">{t('description')}:</span>
                  <span className="detail-value">{selectedTransaction.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('date')}:</span>
                  <span className="detail-value">{formatDate(selectedTransaction.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('type')}:</span>
                  <span className="detail-value">
                    <span className={`type-badge ${selectedTransaction.type.toLowerCase()}`}>
                      {t(selectedTransaction.type.toLowerCase())}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('category')}:</span>
                  <span className="detail-value">{t(selectedTransaction.category.toLowerCase().replace(' ', '_'))}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('amount')}:</span>
                  <span className={`detail-value ${selectedTransaction.type.toLowerCase()}`}>
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>{t('payment_information')}</h3>
                <div className="detail-row">
                  <span className="detail-label">{t('payment_method')}:</span>
                  <span className="detail-value">{t(selectedTransaction.paymentMethod.toLowerCase().replace(' ', '_'))}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('status')}:</span>
                  <span className="detail-value">
                    <span className={`status-badge ${selectedTransaction.status.toLowerCase()}`}>
                      {t(selectedTransaction.status.toLowerCase())}
                    </span>
                  </span>
                </div>
                {selectedTransaction.reference && (
                  <div className="detail-row">
                    <span className="detail-label">{t('reference')}:</span>
                    <span className="detail-value">{selectedTransaction.reference}</span>
                  </div>
                )}
              </div>

              {selectedTransaction.patientName && (
                <div className="detail-section">
                  <h3>{t('patient_information')}</h3>
                  <div className="detail-row">
                    <span className="detail-label">{t('patient_name')}:</span>
                    <span className="detail-value">{selectedTransaction.patientName}</span>
                  </div>
                  {selectedTransaction.patientId && (
                    <div className="detail-row">
                      <span className="detail-label">{t('patient_id')}:</span>
                      <span className="detail-value">{selectedTransaction.patientId}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="close-button"
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

export default Accounting;