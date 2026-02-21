// src/components/Inventory.tsx (replace your existing file)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './Inventory.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

type InventoryStatusLabel = 'Available' | 'Low Stock' | 'Out of Stock';

// ================= Types =================
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  category?: string | null;
  last_updated: string;
  min_stock_level: number;
}

interface InventoryHistoryEntry {
  id: string;
  item: InventoryItem;
  action: 'issued' | 'received' | 'adjusted';
  quantity: number;
  previous_quantity: number;
  timestamp: string;
  performed_by_name?: string | null;
  notes?: string | null;
}

const DEFAULT_MIN_STOCK_LEVEL = 3;

// Axios base
axios.defaults.baseURL = 'http://localhost:8000/technician/inventory/';
axios.defaults.withCredentials = true;

const Inventory: React.FC = () => {
  const { t, language } = useAppSettings();
  const safeLanguage = language || navigator.language || 'en-US';

  // map backend status -> human label (localized)
  const statusLabel = (status: InventoryItem['status']): InventoryStatusLabel => {
    switch (status) {
      case 'available': return (t('available') as string) || 'Available';
      case 'low_stock': return (t('lowStock') as string) || 'Low Stock';
      case 'out_of_stock': return (t('outOfStock') as string) || 'Out of Stock';
      default: return (t('available') as string) || 'Available';
    }
  };

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<InventoryHistoryEntry[]>([]);
  const [modalOpen, setModalOpen] = useState<'issue' | 'receive' | 'add' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id' | 'status' | 'last_updated'>>({
    name: '',
    quantity: 0,
    unit: '',
    category: '',
    min_stock_level: DEFAULT_MIN_STOCK_LEVEL,
  });

  // ================== Fetch inventory & history ==================
  const fetchInventory = async () => {
    try {
      const res = await axios.get('items/');
      // res.data could be array of items or paginated structure depending on DRF settings.
      // If paginated, adjust accordingly; here we assume plain list.
      setInventory(Array.isArray(res.data) ? res.data : (res.data.results ?? res.data));
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('history/');
      setHistory(Array.isArray(res.data) ? res.data : (res.data.results ?? res.data));
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================== Helpers ==================
  const safeToLocaleString = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    try { return value.toLocaleString(safeLanguage); } catch { return String(value); }
  };

  const safeDateToLocaleString = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try { return new Date(dateStr).toLocaleDateString(safeLanguage); } catch { return dateStr; }
  };
  const safeTimeToLocaleString = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleTimeString(safeLanguage); } catch { return ''; }
  };

  // ================== Actions (use server endpoints) ==================
  const handleIssue = async () => {
    if (!selectedItem) return;
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0 || qtyNum > selectedItem.quantity) {
      setError(qtyNum <= 0 ? t('quantityMustBePositive') : `${t('cannotIssueMoreThan')} (${selectedItem.quantity})`);
      return;
    }

    try {
      const res = await axios.post(`items/${selectedItem.id}/issue/`, {
        quantity: qtyNum,
        notes: `${t('issued')} ${qtyNum} ${selectedItem.unit} ${t('of')} ${selectedItem.name}`,
      });

      // server returns { message, item }
      const updated = res.data.item ?? res.data;
      setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));
      await fetchHistory(); // refresh history created by backend
      closeModal();
    } catch (err: any) {
      console.error('Error issuing item:', err);
      setError(err?.response?.data?.error || t('somethingWentWrong'));
    }
  };

  const handleReceive = async () => {
    if (!selectedItem) return;
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError(t('quantityMustBePositive'));
      return;
    }

    try {
      const res = await axios.post(`items/${selectedItem.id}/receive/`, {
        quantity: qtyNum,
        notes: `${t('received')} ${qtyNum} ${selectedItem.unit} ${t('of')} ${selectedItem.name}`,
      });

      const updated = res.data.item ?? res.data;
      setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));
      await fetchHistory();
      closeModal();
    } catch (err: any) {
      console.error('Error receiving item:', err);
      setError(err?.response?.data?.error || t('somethingWentWrong'));
    }
  };

  const handleAddNewItem = async () => {
    if (!newItem.name.trim() || !newItem.unit.trim() || newItem.quantity < 0) {
      setError(
        !newItem.name.trim()
          ? t('itemNameRequired')
          : !newItem.unit.trim()
          ? t('unitRequired')
          : t('quantityCannotBeNegative')
      );
      return;
    }

    const itemToSend = {
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      unit: newItem.unit.trim(),
      category: newItem.category?.trim() || null,
      min_stock_level: (newItem as any).min_stock_level ?? (newItem as any).minStockLevel ?? DEFAULT_MIN_STOCK_LEVEL,
    };

    try {
      const res = await axios.post('items/', itemToSend);
      const created = res.data;
      setInventory(prev => [...prev, created]);
      await fetchHistory(); // server likely created initial 'received' history (if you implement that)
      setNewItem({
        name: '',
        quantity: 0,
        unit: '',
        category: '',
        // keep server field name for state too
        min_stock_level: DEFAULT_MIN_STOCK_LEVEL,
      } as any);
      closeModal();
    } catch (err: any) {
      console.error('Error adding item:', err);
      // show friendly or backend validation errors
      if (err.response?.data) {
        const data = err.response.data;
        // If serializer returns dict of errors:
        const messages = typeof data === 'object'
          ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ')
          : String(data);
        setError(messages);
      } else {
        setError(t('somethingWentWrong'));
      }
    }
  };

  const closeModal = () => {
    setModalOpen(null);
    setSelectedItem(null);
    setQuantity('');
    setError(null);
  };

  // Filtering (search)
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // UI uses the same markup you provided. Only ensure we use backend field names here:
  return (
    <section className="inventory-wrapper">
      <div className="inventory-container">
        <div className="inventory-header">
          <h2 className="inventory-title">{t('inventoryManagement')}</h2>
          <div className="inventory-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder={t('searchItems')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label={t('searchInventoryItems')}
              />
              <span className="search-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setModalOpen('add')}
              aria-label={t('addNewInventoryItem')}
            >
              {t('addItem')}
            </button>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="inventory-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>{t('noInventoryItemsFound')}</p>
            <button
              className="btn btn-primary"
              onClick={() => setModalOpen('add')}
            >
              {t('addYourFirstItem')}
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="inventory-table" role="grid" aria-label={t('labInventoryStock')}>
              <thead>
                <tr>
                  <th scope="col">{t('item')}</th>
                  <th scope="col">{t('category')}</th>
                  <th scope="col">{t('quantity')}</th>
                  <th scope="col">{t('minLevel')}</th>
                  <th scope="col">{t('status')}</th>
                  <th scope="col">{t('lastUpdated')}</th>
                  <th scope="col" aria-label={t('actions')}></th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className={item.status === 'out_of_stock' ? 'row-critical' : ''}>
                    <td>
                      <div className="item-name">{item.name}</div>
                      <div className="item-unit">{item.unit}</div>
                    </td>
                    <td>{item.category || '-'}</td>
                    <td>
                      {safeToLocaleString(item.quantity)} {item.unit}
                    </td>
                    <td>{safeToLocaleString(item.min_stock_level)}</td>
                    <td>
                      <span className={`status-badge status-${item.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      {safeDateToLocaleString(item.last_updated)}
                      <div className="text-muted">
                        {safeTimeToLocaleString(item.last_updated)}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setSelectedItem(item);
                            setModalOpen('issue');
                          }}
                          disabled={item.status === 'out_of_stock'}
                          aria-disabled={item.status === 'out_of_stock'}
                          aria-label={`${t('issue')} ${item.name}`}
                        >
                          {t('issue')}
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setSelectedItem(item);
                            setModalOpen('receive');
                          }}
                          aria-label={`${t('receive')} ${item.name}`}
                        >
                          {t('receive')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals: Issue, Receive, Add */}
        {modalOpen && (
          <>
            {/* Issue Modal */}
            {modalOpen === 'issue' && selectedItem && (
              <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3 className="modal-title">{t('issueStock')}</h3>
                    <button onClick={closeModal} className="modal-close" aria-label={t('close')}>&times;</button>
                  </div>
                  <div className="modal-body">
                    <p className="modal-item-name">{selectedItem.name}</p>
                    <p className="modal-stock-info">
                      {t('currentStock')}: <strong>{safeToLocaleString(selectedItem.quantity)} {selectedItem.unit}</strong>
                    </p>
                    <div className="form-group">
                      <label htmlFor="issueQty">{t('quantityToIssue')} ({selectedItem.unit})</label>
                      <input
                        id="issueQty"
                        type="number"
                        min="1"
                        max={selectedItem.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="form-control"
                        aria-describedby="issue-error"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <div id="issue-error" className="error-message" role="alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4" />
                          <path d="M12 16h.01" />
                        </svg>
                        {error}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>{t('cancel')}</button>
                    <button
                      className="btn btn-danger"
                      onClick={handleIssue}
                      disabled={!quantity || Number(quantity) <= 0 || Number(quantity) > selectedItem.quantity}
                    >
                      {t('confirmIssue')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Receive Modal */}
            {modalOpen === 'receive' && selectedItem && (
              <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3 className="modal-title">{t('receiveStock')}</h3>
                    <button onClick={closeModal} className="modal-close" aria-label={t('close')}>&times;</button>
                  </div>
                  <div className="modal-body">
                    <p className="modal-item-name">{selectedItem.name}</p>
                    <p className="modal-stock-info">
                      {t('currentStock')}: <strong>{safeToLocaleString(selectedItem.quantity)} {selectedItem.unit}</strong>
                    </p>
                    <div className="form-group">
                      <label htmlFor="receiveQty">{t('quantityToReceive')} ({selectedItem.unit})</label>
                      <input
                        id="receiveQty"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="form-control"
                        aria-describedby="receive-error"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <div id="receive-error" className="error-message" role="alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4" />
                          <path d="M12 16h.01" />
                        </svg>
                        {error}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>{t('cancel')}</button>
                    <button
                      className="btn btn-primary"
                      onClick={handleReceive}
                      disabled={!quantity || Number(quantity) <= 0}
                    >
                      {t('confirmReceipt')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Item Modal */}
            {modalOpen === 'add' && (
              <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3 className="modal-title">{t('addNewInventoryItem')}</h3>
                    <button onClick={closeModal} className="modal-close" aria-label={t('close')}>&times;</button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="itemName">{t('itemName')}*</label>
                      <input
                        id="itemName"
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="form-control"
                        autoFocus
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="itemQuantity">{t('initialQuantity')}</label>
                        <input
                          id="itemQuantity"
                          type="number"
                          min="0"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value) || 0})}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="itemUnit">{t('unit')}*</label>
                        <input
                          id="itemUnit"
                          type="text"
                          value={newItem.unit}
                          onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                          className="form-control"
                          placeholder={t('unitPlaceholder')}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="itemCategory">{t('category')}</label>
                      <input
                        id="itemCategory"
                        type="text"
                        value={newItem.category || ''}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="itemMinLevel">{t('minimumStockLevel')}</label>
                      <input
                        id="itemMinLevel"
                        type="number"
                        min="0"
                        value={(newItem as any).min_stock_level ?? DEFAULT_MIN_STOCK_LEVEL}
                        onChange={(e) => setNewItem({...newItem, min_stock_level: Number(e.target.value) || 0} as any)}
                        className="form-control"
                      />
                      <small className="form-text">{t('minStockAlert')}</small>
                    </div>
                    {error && (
                      <div className="error-message" role="alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4" />
                          <path d="M12 16h.01" />
                        </svg>
                        {error}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>{t('cancel')}</button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAddNewItem}
                      disabled={!newItem.name.trim() || !newItem.unit.trim()}
                    >
                      {t('addItem')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Inventory;
