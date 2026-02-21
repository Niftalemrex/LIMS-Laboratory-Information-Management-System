import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { 
  FiPackage, FiFilter, FiSearch,
  FiAlertTriangle, FiCheckCircle, FiMinusCircle,
  FiEdit2, FiTrash2, FiRefreshCw
} from 'react-icons/fi';
import './ManageInventory.css';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  lastUpdated: string;
  location?: string;
  supplier?: string;
}

// ✅ API Base URLs
const INVENTORY_API = "http://localhost:8000/technician/inventory/items/";
const EQUIPMENT_API = "http://localhost:8000/technician/equipment/equipment/";

const ManageInventory: React.FC = () => {
  const { t } = useAppSettings();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<InventoryItem[]>([]);
  const [approvedLab, setApprovedLab] = useState<InventoryItem[]>([]);
  const [approvedEquipment, setApprovedEquipment] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch Lab Inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get(INVENTORY_API);
        const mapped: InventoryItem[] = res.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category || '',
          quantity: item.quantity,
          threshold: item.threshold || 1,
          status: item.quantity <= 0 ? 'out-of-stock' :
                  item.quantity <= (item.threshold || 1) ? 'low-stock' : 'in-stock',
          approvalStatus: 'Pending',
          lastUpdated: item.updated_at || new Date().toISOString(),
          location: item.location || '',
          supplier: item.supplier || ''
        }));
        setInventoryItems(mapped);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setInventoryItems([]);
      }
    };
    fetchInventory();
  }, []);

  // ✅ Fetch Equipment
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await axios.get(EQUIPMENT_API);
        const mapped: InventoryItem[] = res.data.map((eq: any) => ({
          id: eq.id,
          name: eq.name,
          category: 'Equipment',
          quantity: 1,
          threshold: 1,
          status: eq.status === 'operational' ? 'in-stock' :
                  eq.status === 'maintenance' ? 'low-stock' : 'out-of-stock',
          approvalStatus: 'Pending',
          lastUpdated: eq.updated_at || new Date().toISOString(),
          location: eq.department || '',
          supplier: eq.supplier || ''
        }));
        setEquipmentItems(mapped);
      } catch (err) {
        console.error("Error fetching equipment:", err);
        setEquipmentItems([]);
      }
    };
    fetchEquipment();
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'in-stock': return <FiCheckCircle className="status-icon" />;
      case 'low-stock': return <FiAlertTriangle className="status-icon" />;
      case 'out-of-stock': return <FiMinusCircle className="status-icon" />;
      default: return null;
    }
  };

  const handleApproval = (id: string, approval: 'Approved' | 'Rejected', type: 'lab' | 'equipment') => {
    if(type === 'lab'){
      setInventoryItems(prev => prev.map(item => 
        item.id === id ? { ...item, approvalStatus: approval, lastUpdated: new Date().toISOString() } : item
      ));
      if(approval === 'Approved'){
        const approved = inventoryItems.filter(i => i.id === id);
        setApprovedLab(prev => [...prev, ...approved]);
      }
    } else {
      setEquipmentItems(prev => prev.map(item => 
        item.id === id ? { ...item, approvalStatus: approval, lastUpdated: new Date().toISOString() } : item
      ));
      if(approval === 'Approved'){
        const approved = equipmentItems.filter(i => i.id === id);
        setApprovedEquipment(prev => [...prev, ...approved]);
      }
    }
  };

  const handleDelete = (id: string, type: 'lab' | 'equipment') => {
    if(type === 'lab'){
      setInventoryItems(prev => prev.filter(item => item.id !== id));
    } else {
      setEquipmentItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const refreshInventory = async () => {
    setIsLoading(true);
    try {
      const [invRes, eqRes] = await Promise.all([axios.get(INVENTORY_API), axios.get(EQUIPMENT_API)]);
      setInventoryItems(invRes.data);
      setEquipmentItems(eqRes.data);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
    setIsLoading(false);
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filteredEquipment = equipmentItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="inventory-container">
      {/* ===== Header Controls ===== */}
      <div className="inventory-header">
        <h1><FiPackage /> {t('manage_inventory')}</h1>
        <div className="inventory-controls">
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder={t('search_items')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <FiFilter />
            <select value={filter} onChange={e => setFilter(e.target.value as any)}>
              <option value="all">{t('all')}</option>
              <option value="in-stock">{t('in_stock')}</option>
              <option value="low-stock">{t('low_stock')}</option>
              <option value="out-of-stock">{t('out_of_stock')}</option>
            </select>
          </div>
          <button className="refresh-button" onClick={refreshInventory} disabled={isLoading}>
            <FiRefreshCw /> {t('refresh')}
          </button>
        </div>
      </div>

      {/* Lab Inventory Table */}
      <div className="inventory-table-container">
        <h2>{t('lab_inventory')}</h2>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>#</th><th>{t('item_name')}</th><th>{t('category')}</th><th>{t('quantity')}</th>
              <th>{t('threshold')}</th><th>{t('status')}</th><th>{t('location')}</th>
              <th>{t('last_updated')}</th><th>{t('approval')}</th><th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? filteredItems.map((item, idx) => (
              <tr key={item.id} className={`inventory-item ${item.status}`}>
                <td>{idx+1}</td>
                <td>
                  <div className="item-name">{item.name}</div>
                  {item.supplier && <div className="item-supplier">{item.supplier}</div>}
                </td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.threshold}</td>
                <td><div className={`status-badge ${item.status}`}>{getStatusIcon(item.status)} {item.status}</div></td>
                <td>{item.location}</td>
                <td>{new Date(item.lastUpdated).toLocaleString()}</td>
                <td><div className={`approval-badge ${item.approvalStatus.toLowerCase()}`}>{t(item.approvalStatus)}</div></td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-button"><FiEdit2 /></button>
                    <button className="delete-button" onClick={() => handleDelete(item.id,'lab')}><FiTrash2 /></button>
                    {item.approvalStatus === 'Pending' && <>
                      <button className="approve-button" onClick={() => handleApproval(item.id,'Approved','lab')}>{t('approve')}</button>
                      <button className="reject-button" onClick={() => handleApproval(item.id,'Rejected','lab')}>{t('reject')}</button>
                    </>}
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={10}>{t('no_inventory_items')}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Equipment Inventory Table */}
      <div className="inventory-table-container">
        <h2>{t('equipment_inventory')}</h2>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>#</th><th>{t('item_name')}</th><th>{t('category')}</th><th>{t('quantity')}</th>
              <th>{t('threshold')}</th><th>{t('status')}</th><th>{t('location')}</th>
              <th>{t('last_updated')}</th><th>{t('approval')}</th><th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.length > 0 ? filteredEquipment.map((item, idx) => (
              <tr key={item.id} className={`inventory-item ${item.status}`}>
                <td>{idx+1}</td>
                <td>
                  <div className="item-name">{item.name}</div>
                  {item.supplier && <div className="item-supplier">{item.supplier}</div>}
                </td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.threshold}</td>
                <td><div className={`status-badge ${item.status}`}>{getStatusIcon(item.status)} {item.status}</div></td>
                <td>{item.location}</td>
                <td>{new Date(item.lastUpdated).toLocaleString()}</td>
                <td><div className={`approval-badge ${item.approvalStatus.toLowerCase()}`}>{t(item.approvalStatus)}</div></td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-button"><FiEdit2 /></button>
                    <button className="delete-button" onClick={() => handleDelete(item.id,'equipment')}><FiTrash2 /></button>
                    {item.approvalStatus === 'Pending' && <>
                      <button className="approve-button" onClick={() => handleApproval(item.id,'Approved','equipment')}>{t('approve')}</button>
                      <button className="reject-button" onClick={() => handleApproval(item.id,'Rejected','equipment')}>{t('reject')}</button>
                    </>}
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={10}>{t('no_inventory_items')}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ✅ Approved Lab Inventory */}
      <div className="inventory-table-container">
        <h2>{t('approved_lab_inventory')}</h2>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>#</th><th>{t('item_name')}</th><th>{t('category')}</th><th>{t('quantity')}</th>
              <th>{t('threshold')}</th><th>{t('status')}</th><th>{t('location')}</th>
              <th>{t('last_updated')}</th>
            </tr>
          </thead>
          <tbody>
            {approvedLab.length > 0 ? approvedLab.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx+1}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.threshold}</td>
                <td>{item.status}</td>
                <td>{item.location}</td>
                <td>{new Date(item.lastUpdated).toLocaleString()}</td>
              </tr>
            )) : <tr><td colSpan={8}>{t('no_approved_items')}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ✅ Approved Equipment Inventory */}
      <div className="inventory-table-container">
        <h2>{t('approved_equipment_inventory')}</h2>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>#</th><th>{t('item_name')}</th><th>{t('category')}</th><th>{t('quantity')}</th>
              <th>{t('threshold')}</th><th>{t('status')}</th><th>{t('location')}</th>
              <th>{t('last_updated')}</th>
            </tr>
          </thead>
          <tbody>
            {approvedEquipment.length > 0 ? approvedEquipment.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx+1}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.threshold}</td>
                <td>{item.status}</td>
                <td>{item.location}</td>
                <td>{new Date(item.lastUpdated).toLocaleString()}</td>
              </tr>
            )) : <tr><td colSpan={8}>{t('no_approved_items')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageInventory;
