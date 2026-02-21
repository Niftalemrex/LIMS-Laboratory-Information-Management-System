import React, { useState, useCallback } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './ContractsDiscounts.css';

interface Contract {
  id: string;
  name: string;
  discountRate: number;
  startDate: string;
  endDate: string;
  active: boolean;
  contractType: 'Individual' | 'Corporate' | 'Government';
  minValue?: number;
  maxValue?: number;
  applicableServices: string[];
  createdAt: string;
  updatedAt?: string;
}

const ContractsDiscounts: React.FC = () => {
  const { t } = useAppSettings();
  const [contracts, setContracts] = useState<Contract[]>([
    { 
      id: '1', 
      name: 'Gold Plan', 
      discountRate: 15, 
      startDate: '2023-01-01', 
      endDate: '2023-12-31', 
      active: true,
      contractType: 'Corporate',
      minValue: 1000,
      applicableServices: ['All Services'],
      createdAt: '2022-11-15'
    },
    { 
      id: '2', 
      name: 'Silver Plan', 
      discountRate: 10, 
      startDate: '2023-01-01', 
      endDate: '2023-12-31', 
      active: true,
      contractType: 'Individual',
      maxValue: 500,
      applicableServices: ['Lab Tests', 'Consultations'],
      createdAt: '2022-12-01'
    },
    { 
      id: '3', 
      name: 'Government Plan', 
      discountRate: 20, 
      startDate: '2023-01-01', 
      endDate: '2024-12-31', 
      active: false,
      contractType: 'Government',
      applicableServices: ['Vaccinations', 'Screenings'],
      createdAt: '2022-10-10',
      updatedAt: '2023-05-20'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [newContract, setNewContract] = useState<Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'active'>>({
    name: '',
    discountRate: 0,
    startDate: '',
    endDate: '',
    contractType: 'Individual',
    applicableServices: [],
    minValue: undefined,
    maxValue: undefined
  });

  const toggleActive = useCallback((id: string) => {
    setContracts(prev => prev.map(contract => 
      contract.id === id ? { 
        ...contract, 
        active: !contract.active,
        updatedAt: new Date().toISOString()
      } : contract
    ));
  }, []);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterActive === 'all' || 
      (filterActive === 'active' && contract.active) || 
      (filterActive === 'inactive' && !contract.active);
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddContract = () => {
    const newId = (contracts.length + 1).toString();
    setContracts(prev => [
      ...prev,
      {
        ...newContract,
        id: newId,
        active: true,
        createdAt: new Date().toISOString(),
        applicableServices: newContract.applicableServices[0] === '' ? [] : newContract.applicableServices
      }
    ]);
    setIsAddingContract(false);
    setNewContract({
      name: '',
      discountRate: 0,
      startDate: '',
      endDate: '',
      contractType: 'Individual',
      applicableServices: [],
      minValue: undefined,
      maxValue: undefined
    });
  };

  const handleServiceChange = (index: number, value: string) => {
    const updatedServices = [...newContract.applicableServices];
    updatedServices[index] = value;
    setNewContract(prev => ({ ...prev, applicableServices: updatedServices }));
  };

  const addServiceField = () => {
    setNewContract(prev => ({ ...prev, applicableServices: [...prev.applicableServices, ''] }));
  };

  const removeServiceField = (index: number) => {
    const updatedServices = newContract.applicableServices.filter((_, i) => i !== index);
    setNewContract(prev => ({ ...prev, applicableServices: updatedServices }));
  };

  return (
    <div className="contracts-dashboard">
      <header className="dashboard-header">
        <h1>{t('contract_management')}</h1>
        <div className="controls">
          <input
            type="text"
            placeholder={t('search_contracts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label={t('search_contracts')}
          />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="status-filter"
            aria-label={t('filter_contracts_by_status')}
          >
            <option value="all">{t('all_contracts')}</option>
            <option value="active">{t('active_only')}</option>
            <option value="inactive">{t('inactive_only')}</option>
          </select>
          <button 
            onClick={() => setIsAddingContract(true)}
            className="add-button"
          >
            {t('add_new_contract')}
          </button>
        </div>
      </header>

      <div className="contracts-content">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-value">{contracts.length}</div>
            <div className="summary-label">{t('total_contracts')}</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{contracts.filter(c => c.active).length}</div>
            <div className="summary-label">{t('active')}</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {Math.max(...contracts.map(c => c.discountRate), 0)}%
            </div>
            <div className="summary-label">{t('highest_discount')}</div>
          </div>
        </div>

        <div className="table-container">
          <table className="contracts-table">
            <thead>
              <tr>
                <th>{t('contract_name')}</th>
                <th>{t('discount')}</th>
                <th>{t('period')}</th>
                <th>{t('type')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(contract => (
                <tr key={contract.id} className={contract.active ? 'active' : 'inactive'}>
                  <td>
                    <div className="contract-name">{contract.name}</div>
                    <div className="contract-services">
                      {contract.applicableServices.join(', ')}
                    </div>
                  </td>
                  <td className="discount-cell">{contract.discountRate}%</td>
                  <td>
                    {formatDate(contract.startDate)} {t('to')} {formatDate(contract.endDate)}
                  </td>
                  <td>
                    <span className={`contract-type ${contract.contractType.toLowerCase()}`}>
                      {t(contract.contractType.toLowerCase())}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${contract.active ? 'active' : 'inactive'}`}>
                      {contract.active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => toggleActive(contract.id)}
                      className={`status-button ${contract.active ? 'deactivate' : 'activate'}`}
                    >
                      {contract.active ? t('deactivate') : t('activate')}
                    </button>
                    <button 
                      onClick={() => setSelectedContract(contract)}
                      className="details-button"
                    >
                      {t('details')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contract Modal */}
      {isAddingContract && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('add_new_contract')}</h2>
              <button 
                className="close-button"
                onClick={() => setIsAddingContract(false)}
                aria-label={t('close_modal')}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t('contract_name')}</label>
                <input
                  type="text"
                  value={newContract.name}
                  onChange={(e) => setNewContract({...newContract, name: e.target.value})}
                  placeholder={t('enter_contract_name')}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('discount_rate_percent')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newContract.discountRate}
                    onChange={(e) => setNewContract({...newContract, discountRate: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>{t('contract_type')}</label>
                  <select
                    value={newContract.contractType}
                    onChange={(e) => setNewContract({...newContract, contractType: e.target.value as any})}
                  >
                    <option value="Individual">{t('individual')}</option>
                    <option value="Corporate">{t('corporate')}</option>
                    <option value="Government">{t('government')}</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('start_date')}</label>
                  <input
                    type="date"
                    value={newContract.startDate}
                    onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>{t('end_date')}</label>
                  <input
                    type="date"
                    value={newContract.endDate}
                    onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('minimum_value_optional')}</label>
                  <input
                    type="number"
                    min="0"
                    value={newContract.minValue || ''}
                    onChange={(e) => setNewContract({...newContract, minValue: e.target.value ? Number(e.target.value) : undefined})}
                    placeholder={t('enter_min_value')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('maximum_value_optional')}</label>
                  <input
                    type="number"
                    min="0"
                    value={newContract.maxValue || ''}
                    onChange={(e) => setNewContract({...newContract, maxValue: e.target.value ? Number(e.target.value) : undefined})}
                    placeholder={t('enter_max_value')}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t('applicable_services')}</label>
                {newContract.applicableServices.map((service, index) => (
                  <div key={index} className="service-input">
                    <input
                      type="text"
                      value={service}
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                      placeholder={t('service_name_placeholder')}
                    />
                    <button 
                      type="button"
                      onClick={() => removeServiceField(index)}
                      className="remove-service"
                      aria-label={t('remove_service')}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addServiceField}
                  className="add-service"
                >
                  + {t('add_service')}
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={handleAddContract}
                className="save-button"
                disabled={!newContract.name || !newContract.startDate || !newContract.endDate}
              >
                {t('save_contract')}
              </button>
              <button 
                onClick={() => setIsAddingContract(false)}
                className="cancel-button"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('contract_details')}</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedContract(null)}
                aria-label={t('close_modal')}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>{t('basic_information')}</h3>
                <div className="detail-row">
                  <span className="detail-label">{t('name')}:</span>
                  <span className="detail-value">{selectedContract.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('type')}:</span>
                  <span className="detail-value">
                    <span className={`contract-type ${selectedContract.contractType.toLowerCase()}`}>
                      {t(selectedContract.contractType.toLowerCase())}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('discount_rate')}:</span>
                  <span className="detail-value">{selectedContract.discountRate}%</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('status')}:</span>
                  <span className="detail-value">
                    <span className={`status-badge ${selectedContract.active ? 'active' : 'inactive'}`}>
                      {selectedContract.active ? t('active') : t('inactive')}
                    </span>
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>{t('validity_period')}</h3>
                <div className="detail-row">
                  <span className="detail-label">{t('start_date')}:</span>
                  <span className="detail-value">{formatDate(selectedContract.startDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('end_date')}:</span>
                  <span className="detail-value">{formatDate(selectedContract.endDate)}</span>
                </div>
                {selectedContract.minValue && (
                  <div className="detail-row">
                    <span className="detail-label">{t('minimum_value')}:</span>
                    <span className="detail-value">${selectedContract.minValue}</span>
                  </div>
                )}
                {selectedContract.maxValue && (
                  <div className="detail-row">
                    <span className="detail-label">{t('maximum_value')}:</span>
                    <span className="detail-value">${selectedContract.maxValue}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>{t('applicable_services')}</h3>
                <ul className="services-list">
                  {selectedContract.applicableServices.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h3>{t('metadata')}</h3>
                <div className="detail-row">
                  <span className="detail-label">{t('created')}:</span>
                  <span className="detail-value">{formatDate(selectedContract.createdAt)}</span>
                </div>
                {selectedContract.updatedAt && (
                  <div className="detail-row">
                    <span className="detail-label">{t('last_updated')}:</span>
                    <span className="detail-value">{formatDate(selectedContract.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setSelectedContract(null)}
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

export default ContractsDiscounts;