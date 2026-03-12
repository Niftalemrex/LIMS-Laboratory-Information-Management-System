import React, { useState, useEffect } from 'react';
import { 
  FiTool, 
  FiCalendar, 
  FiAlertTriangle, 
  FiPlus,
  FiCheckCircle,
  FiX,
  FiEdit2,
  FiClock,
  FiSearch
} from 'react-icons/fi';
import './Equipment.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

type EquipmentStatus = 'operational' | 'maintenance' | 'out-of-service';
type EquipmentPriority = 'low' | 'medium' | 'high';

interface EquipmentItem {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  department: string;
  calibrationDate: string | null;
  nextCalibrationDate: string | null;
  lastMaintenance: string | null;
  status: EquipmentStatus;
  priority: EquipmentPriority;
  notes: string;
}

const API_URL = 'http://localhost:8000/technician/equipment/equipment/';

const Equipment: React.FC = () => {
  const { t } = useAppSettings();

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, ] = useState<EquipmentStatus | 'All'>('All');
  const [priorityFilter, ] = useState<EquipmentPriority | 'All'>('All');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'calibration' | 'maintenance' | 'status' | 'add' | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [dateValue, setDateValue] = useState('');
  const [notesValue, setNotesValue] = useState('');

  const [newEquipment, setNewEquipment] = useState<Partial<EquipmentItem>>({
    name: '',
    model: '',
    serialNumber: '',
    department: '',
    priority: 'low',
    status: 'operational',
    notes: '',
    calibrationDate: '',
    lastMaintenance: ''
  });

  // ---------------- Fetch equipment from backend ----------------
  const fetchEquipment = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
  
      // Map snake_case to camelCase
      const mapped = data.map((item: any) => ({
        ...item,
        calibrationDate: item.calibration_date,
        nextCalibrationDate: item.next_calibration_date,
        lastMaintenance: item.last_maintenance,
        serialNumber: item.serial_number
      }));
  
      setEquipment(mapped);
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
    }
  };
  

  useEffect(() => {
    fetchEquipment();
  }, []);

  // ---------------- Modal handlers ----------------
  const openModal = (type: 'calibration' | 'maintenance' | 'status', equip: EquipmentItem) => {
    setModalType(type);
    setSelectedEquipment(equip);
    setDateValue('');
    setNotesValue('');
    setModalOpen(true);
  };

  const openAddModal = () => {
    setModalType('add');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setSelectedEquipment(null);
    setDateValue('');
    setNotesValue('');
    setNewEquipment({
      name: '',
      model: '',
      serialNumber: '',
      department: '',
      priority: 'low',
      status: 'operational',
      notes: '',
      calibrationDate: '',
      lastMaintenance: ''
    });
  };

  // ---------------- Save/Update equipment ----------------
 // ---------------- Save/Update equipment ----------------
const handleSave = async () => {
  try {
    if (modalType === 'add') {
      // Map frontend camelCase to backend snake_case
      const payload = {
        name: newEquipment.name,
        model: newEquipment.model,
        serial_number: newEquipment.serialNumber,
        department: newEquipment.department,
        calibration_date: newEquipment.calibrationDate || null,
        last_maintenance: newEquipment.lastMaintenance || null,
        next_calibration_date: newEquipment.nextCalibrationDate || null,
        status: newEquipment.status || 'operational',
        priority: newEquipment.priority || 'low',
        notes: newEquipment.notes || ''
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error('Failed to save equipment:', errData);
        return;
      }

      const data = await res.json();
      setEquipment(prev => [...prev, data]);
      closeModal();
      return;
    }

    if (!selectedEquipment) return;

    // Update modal
    let updatedData: any = {};

    if (modalType === 'calibration') {
      updatedData.calibration_date = dateValue || new Date().toISOString().split('T')[0];
    }

    if (modalType === 'maintenance') {
      updatedData.last_maintenance = dateValue || new Date().toISOString().split('T')[0];
    }

    if (modalType === 'status') {
      updatedData.status = notesValue as EquipmentStatus;
    }

    if (notesValue) {
      updatedData.notes = notesValue;
    }

    const res = await fetch(`${API_URL}${selectedEquipment.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('Failed to update equipment:', errData);
      return;
    }

    const data = await res.json();
    setEquipment(prev => prev.map(item => item.id === data.id ? data : item));
    closeModal();
  } catch (err) {
    console.error('Failed to save/update equipment:', err);
  }
};


  // ---------------- Filters ----------------
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // ---------------- Badge helpers ----------------
  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'operational':
        return <span className="status-badge operational"><FiCheckCircle /> {t('operational') || 'Operational'}</span>;
      case 'maintenance':
        return <span className="status-badge maintenance"><FiTool /> {t('maintenance') || 'Maintenance'}</span>;
      case 'out-of-service':
        return <span className="status-badge out-of-service"><FiAlertTriangle /> {t('out_of_service') || 'Out of Service'}</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: EquipmentPriority) => {
    switch (priority) {
      case 'low':
        return <span className="priority-badge low">{t('low') || 'Low'}</span>;
      case 'medium':
        return <span className="priority-badge medium">{t('medium') || 'Medium'}</span>;
      case 'high':
        return <span className="priority-badge high">{t('high') || 'High'}</span>;
      default:
        return <span className="priority-badge">{priority}</span>;
    }
  };

  return (
    <div className="equipment-container">
      <header className="equipment-header">
        <div className="header-content">
          <h1>{t('equipment_management') || 'Equipment Management'}</h1>
          <p>{t('equipment_management_subtitle') || 'Track and manage laboratory equipment status and maintenance'}</p>
        </div>
        <button className="btn primary" onClick={openAddModal}>
          <FiPlus /> {t('add_equipment') || 'Add Equipment'}
        </button>
      </header>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-filter">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('search_equipment') || 'Search equipment...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="equipment-grid">
        {filteredEquipment.length === 0 ? (
          <div className="empty-state">
            <p>{t('no_equipment_match') || 'No equipment matches your search criteria'}</p>
          </div>
        ) : (
          filteredEquipment.map(item => (
            <div key={item.id} className="equipment-card">
              <div className="card-header">
                <h3>{item.name}</h3>
                <div className="card-meta">
                  <span>{item.model}</span>
                  <span>{item.department}</span>
                </div>
              </div>
              
              <div className="card-body">
                <div className="status-row">
                  {getStatusBadge(item.status)}
                  {getPriorityBadge(item.priority)}
                </div>
                
                <div className="info-row">
                  <div className="info-item">
                    <FiCalendar />
                    <div>
                      <span className="info-label">{t('last_calibration') || 'Last Calibration'}:</span>
                      <span>{item.calibrationDate || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <FiClock />
                    <div>
                      <span className="info-label">{t('next_calibration') || 'Next Calibration'}:</span>
                      <span>{item.nextCalibrationDate || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <FiTool />
                    <div>
                      <span className="info-label">{t('last_maintenance') || 'Last Maintenance'}:</span>
                      <span>{item.lastMaintenance || '-'}</span>
                    </div>
                  </div>
                </div>
                
                {item.notes && (
                  <div className="notes">
                    <p>{item.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="card-actions">
                <button className="btn secondary" onClick={() => openModal('calibration', item)}>
                  <FiCalendar /> {t('calibrate') || 'Calibrate'}
                </button>
                <button className="btn secondary" onClick={() => openModal('maintenance', item)}>
                  <FiTool /> {t('maintain') || 'Maintain'}
                </button>
                <button className="btn secondary" onClick={() => openModal('status', item)}>
                  <FiEdit2 /> {t('status') || 'Status'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}><FiX /></button>
            <h2 className="modal-title">
              {modalType === 'calibration' && (t('equipment_calibration') || 'Equipment Calibration')}
              {modalType === 'maintenance' && (t('maintenance_record') || 'Maintenance Record')}
              {modalType === 'status' && (t('update_equipment_status') || 'Update Equipment Status')}
              {modalType === 'add' && (t('add_equipment') || 'Add Equipment')}
            </h2>

            {modalType === 'add' ? (
              <>
                <div className="form-group">
                  <label>{t('name') || 'Name'}</label>
                  <input type="text" value={newEquipment.name || ''} onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('model') || 'Model'}</label>
                  <input type="text" value={newEquipment.model || ''} onChange={e => setNewEquipment({ ...newEquipment, model: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('serial_number') || 'Serial Number'}</label>
                  <input type="text" value={newEquipment.serialNumber || ''} onChange={e => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('department') || 'Department'}</label>
                  <input type="text" value={newEquipment.department || ''} onChange={e => setNewEquipment({ ...newEquipment, department: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('calibration_date') || 'Calibration Date'}</label>
                  <input type="date" value={newEquipment.calibrationDate || ''} onChange={e => setNewEquipment({ ...newEquipment, calibrationDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('last_maintenance') || 'Last Maintenance'}</label>
                  <input type="date" value={newEquipment.lastMaintenance || ''} onChange={e => setNewEquipment({ ...newEquipment, lastMaintenance: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('priority') || 'Priority'}</label>
                  <select value={newEquipment.priority} onChange={e => setNewEquipment({ ...newEquipment, priority: e.target.value as EquipmentPriority })}>
                    <option value="low">{t('low') || 'Low'}</option>
                    <option value="medium">{t('medium') || 'Medium'}</option>
                    <option value="high">{t('high') || 'High'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('notes') || 'Notes'}</label>
                  <textarea value={newEquipment.notes || ''} onChange={e => setNewEquipment({ ...newEquipment, notes: e.target.value })} />
                </div>
              </>
            ) : (
              <>
                {modalType === 'status' ? (
                  <div className="form-group">
                    <label>{t('status') || 'Status'}</label>
                    <select value={notesValue || selectedEquipment?.status} onChange={e => setNotesValue(e.target.value)}>
                      <option value="operational">{t('operational') || 'Operational'}</option>
                      <option value="maintenance">{t('maintenance') || 'Maintenance'}</option>
                      <option value="out-of-service">{t('out_of_service') || 'Out of Service'}</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>{modalType === 'calibration' ? (t('calibration_date') || 'Calibration Date') : (t('maintenance_date') || 'Maintenance Date')}</label>
                    <input type="date" value={dateValue} onChange={e => setDateValue(e.target.value)} />
                  </div>
                )}

                <div className="form-group">
                  <label>{t('notes') || 'Notes'}</label>
                  <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)} placeholder={t('add_relevant_notes') || 'Add any relevant notes...'} />
                </div>
              </>
            )}

            <div className="modal-actions">
              <button className="btn secondary" onClick={closeModal}>{t('cancel') || 'Cancel'}</button>
              <button className="btn primary" onClick={handleSave}>{modalType === 'add' ? (t('add') || 'Add') : (t('save_changes') || 'Save Changes')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
