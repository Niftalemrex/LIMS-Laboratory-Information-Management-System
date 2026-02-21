import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Plus, Minus, Save, X } from 'lucide-react';
import './Inventory.css';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { v4 as uuidv4 } from 'uuid';

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

const INVENTORY_STORAGE_KEYS = {
  INVENTORY: 'approvedSupportInventory',
  EQUIPMENT: 'approvedSupportEquipment',
};

const Inventory: React.FC = () => {
  const { t } = useAppSettings();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipmentInventory, setEquipmentInventory] = useState<InventoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    threshold: '',
    location: '',
    supplier: '',
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem; direction: 'ascending' | 'descending' } | null>(null);

  // --- Load from LocalStorage ---
  useEffect(() => {
    const loadInventory = (key: string) => {
      const stored = localStorage.getItem(key);
      return stored
        ? JSON.parse(stored).map((item: any) => ({
            ...item,
            id: item.id || uuidv4(),
            lastUpdated: item.lastUpdated || new Date().toISOString(),
          }))
        : [];
    };
    setInventory(loadInventory(INVENTORY_STORAGE_KEYS.INVENTORY));
    setEquipmentInventory(loadInventory(INVENTORY_STORAGE_KEYS.EQUIPMENT));
  }, []);

  // --- Persist to LocalStorage ---
  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipmentInventory));
  }, [equipmentInventory]);

  // --- Update status based on threshold ---
  const updateStatus = (inv: InventoryItem[]) =>
    inv.map((item) => {
      let status: InventoryItem['status'] = 'in-stock';
      if (item.quantity === 0) status = 'out-of-stock';
      else if (item.quantity <= item.threshold) status = 'low-stock';
      return item.status !== status ? { ...item, status } : item;
    });

  useEffect(() => {
    setInventory((prev) => updateStatus(prev));
    setEquipmentInventory((prev) => updateStatus(prev));
  }, [inventory.map((i) => i.quantity).join(','), equipmentInventory.map((i) => i.quantity).join(',')]);

  // --- Sorting ---
  const requestSort = (key: keyof InventoryItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };

  const sortItems = (items: InventoryItem[]) => {
    if (!sortConfig) return items;
    const { key, direction } = sortConfig;
    return [...items].sort((a, b) => {
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return direction === 'ascending' ? -1 : 1;
      if (valA > valB) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  const sortedInventory = useMemo(() => sortItems(inventory), [inventory, sortConfig]);
  const sortedEquipmentInventory = useMemo(() => sortItems(equipmentInventory), [equipmentInventory, sortConfig]);

  // --- Editing ---
  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      threshold: item.threshold.toString(),
      location: item.location || '',
      supplier: item.supplier || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', quantity: '', threshold: '', location: '', supplier: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveItem = () => {
    if (!editingId) return;
    const quantityNum = Number(formData.quantity);
    const thresholdNum = Number(formData.threshold);

    if (!formData.name.trim()) return alert(t('item_name_required'));
    if (isNaN(quantityNum) || quantityNum < 0) return alert(t('invalid_quantity'));
    if (isNaN(thresholdNum) || thresholdNum < 0) return alert(t('invalid_threshold'));

    const updateInv = (inv: InventoryItem[]) =>
      inv.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name: formData.name.trim(),
              category: formData.category.trim(),
              quantity: quantityNum,
              threshold: thresholdNum,
              location: formData.location.trim(),
              supplier: formData.supplier.trim(),
              lastUpdated: new Date().toISOString(),
            }
          : item
      );

    setInventory(updateInv);
    setEquipmentInventory(updateInv);
    cancelEdit();
  };

  // --- Delete ---
  const deleteItem = (id: string, isEquipment = false) => {
    if (!window.confirm(t('confirm_delete'))) return;
    if (isEquipment) setEquipmentInventory((inv) => inv.filter((i) => i.id !== id));
    else setInventory((inv) => inv.filter((i) => i.id !== id));
    if (editingId === id) cancelEdit();
  };

  // --- Quick adjust ---
  const scanIn = (id: string, isEquipment = false) => {
    const updater = (inv: InventoryItem[]) =>
      inv.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1, lastUpdated: new Date().toISOString() } : item));
    isEquipment ? setEquipmentInventory(updater) : setInventory(updater);
  };

  const scanOut = (id: string, isEquipment = false) => {
    const updater = (inv: InventoryItem[]) =>
      inv.map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1), lastUpdated: new Date().toISOString() } : item));
    isEquipment ? setEquipmentInventory(updater) : setInventory(updater);
  };

  // --- Helpers ---
  const getStatusClass = (status: InventoryItem['status']) => status.toLowerCase().replace(/\s/g, '-');
  const getTranslatedStatus = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return t('in_stock');
      case 'low-stock':
        return t('low_stock');
      case 'out-of-stock':
        return t('out_of_stock');
      default:
        return status;
    }
  };

  const renderTable = (items: InventoryItem[], isEquipment = false) => (
    <div className="table-container">
      <table className="inventory-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('id')}>{t('id')}</th>
            <th onClick={() => requestSort('name')}>{t('item')}</th>
            <th onClick={() => requestSort('category')}>{t('category')}</th>
            <th onClick={() => requestSort('quantity')}>{t('quantity')}</th>
            <th onClick={() => requestSort('threshold')}>{t('threshold')}</th>
            <th onClick={() => requestSort('status')}>{t('status')}</th>
            <th onClick={() => requestSort('lastUpdated')}>{t('last_updated')}</th>
            <th>{t('actions')}</th>
            <th>{t('quick_adjust')}</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((item) => (
              <tr key={item.id} className={`inventory-row ${getStatusClass(item.status)}`}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.threshold}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>{getTranslatedStatus(item.status)}</span>
                </td>
                <td>{new Date(item.lastUpdated).toLocaleString()}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => startEdit(item)} className="edit-button">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteItem(item.id, isEquipment)} className="delete-button">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="scan-buttons">
                    <button onClick={() => scanIn(item.id, isEquipment)} className="scan-in-button">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => scanOut(item.id, isEquipment)} className="scan-out-button">
                      <Minus size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9}>
                <div className="empty-state">{t('no_inventory_items')}</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="inventory-container">
      <header className="inventory-header">
        <div>
          <h1>{t('inventory_management')}</h1>
          <p className="inventory-subtitle">{t('inventory_subtitle')}</p>
        </div>
      </header>

      {editingId && (
        <div className="inventory-form">
          <input type="text" name="name" placeholder={t('item_name_placeholder')} value={formData.name} onChange={handleChange} className="form-input" />
          <input type="text" name="category" placeholder={t('category_placeholder')} value={formData.category} onChange={handleChange} className="form-input" />
          <input type="number" name="quantity" placeholder={t('quantity_placeholder')} value={formData.quantity} onChange={handleChange} min={0} className="form-input" />
          <input type="number" name="threshold" placeholder={t('threshold_placeholder')} value={formData.threshold} onChange={handleChange} min={0} className="form-input" />
          <input type="text" name="location" placeholder={t('location_placeholder')} value={formData.location} onChange={handleChange} className="form-input" />
          <input type="text" name="supplier" placeholder={t('supplier_placeholder')} value={formData.supplier} onChange={handleChange} className="form-input" />
          <button onClick={saveItem} className="save-button">
            <Save size={16} /> {t('update')}
          </button>
          <button onClick={cancelEdit} className="cancel-button">
            <X size={16} /> {t('cancel')}
          </button>
        </div>
      )}

      <h2>{t('inventory')}</h2>
      {renderTable(sortedInventory)}

      <h2>{t('equipment_inventory')}</h2>
      {renderTable(sortedEquipmentInventory, true)}
    </div>
  );
};

export default Inventory;
