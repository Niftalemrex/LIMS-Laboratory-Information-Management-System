import React, { useState } from 'react';
import { 
  FaBoxes, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaChevronRight,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import './Reorders.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface ReorderItem {
  id: number;
  itemName: string;
  currentStock: number;
  reorderLevel: number;
  status: 'OK' | 'Low Stock' | 'Reorder Needed';
  category: string;
  lastOrdered: string;
  reordered?: boolean;
}

const Reorders: React.FC = () => {
  const { t } = useAppSettings();
  
  const initialReorders: ReorderItem[] = [
    { 
      id: 1, 
      itemName: t('blood_collection_tubes'), 
      currentStock: 120, 
      reorderLevel: 50, 
      status: 'OK', 
      category: t('lab_supplies'),
      lastOrdered: '2023-05-15'
    },
    { 
      id: 2, 
      itemName: t('covid_test_kits'), 
      currentStock: 20, 
      reorderLevel: 30, 
      status: 'Low Stock', 
      category: t('diagnostics'),
      lastOrdered: '2023-05-10'
    },
    { 
      id: 3, 
      itemName: t('nitrile_gloves'), 
      currentStock: 0, 
      reorderLevel: 40, 
      status: 'Reorder Needed', 
      category: t('ppe'),
      lastOrdered: '2023-04-28'
    },
    { 
      id: 4, 
      itemName: t('alcohol_swabs'), 
      currentStock: 15, 
      reorderLevel: 25, 
      status: 'Low Stock', 
      category: t('consumables'),
      lastOrdered: '2023-05-01'
    },
    { 
      id: 5, 
      itemName: t('gauze_pads'), 
      currentStock: 45, 
      reorderLevel: 50, 
      status: 'OK', 
      category: t('wound_care'),
      lastOrdered: '2023-05-12'
    },
  ];

  const [reorders, setReorders] = useState<ReorderItem[]>(initialReorders);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(t('all'));
  const [statusFilter, setStatusFilter] = useState<string>(t('all'));

  // Get unique categories for filter
  const categories = [t('all'), ...new Set(initialReorders.map(item => item.category))];

  // Filter items based on search and filters
  const filteredItems = reorders.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === t('all') || item.category === categoryFilter;
    const matchesStatus = statusFilter === t('all') || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const triggerReorder = (id: number) => {
    setReorders(curr =>
      curr.map(item =>
        item.id === id ? { ...item, reordered: true } : item
      )
    );
    console.log(t('reorder_triggered', { id }));
  };

  const triggerAllReorders = () => {
    const needsReorder = reorders.filter(item => 
      (item.status === 'Reorder Needed' || item.status === 'Low Stock') && !item.reordered
    );
    
    if (needsReorder.length === 0) {
      alert(t('no_items_need_reorder'));
      return;
    }

    setReorders(curr =>
      curr.map(item =>
        (item.status === 'Reorder Needed' || item.status === 'Low Stock') && !item.reordered
          ? { ...item, reordered: true }
          : item
      )
    );
    console.log(t('reorders_triggered', { count: needsReorder.length }));
  };

  const getStatusIcon = (status: ReorderItem['status']) => {
    switch (status) {
      case 'OK': return <FaCheckCircle className="status-icon ok" />;
      case 'Low Stock': return <FaExclamationTriangle className="status-icon low" />;
      case 'Reorder Needed': return <FaBoxes className="status-icon reorder" />;
      default: return null;
    }
  };

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'OK': return t('ok');
      case 'Low Stock': return t('low_stock');
      case 'Reorder Needed': return t('reorder_needed');
      case 'All': return t('all');
      default: return status;
    }
  };

  return (
    <section className="reorders-container">
      <header className="reorders-header">
        <div className="header-content">
          <h1>{t('inventory_management')}</h1>
          <p>{t('monitor_stock_levels')}</p>
        </div>
        <button className="btn-primary" onClick={triggerAllReorders}>
          {t('reorder_all_needed')}
        </button>
      </header>

      <div className="controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('search_items_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-dropdown">
            <FaFilter className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="filter-dropdown">
            <FaFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value={t('all')}>{t('all_statuses')}</option>
              <option value="OK">{t('ok')}</option>
              <option value="Low Stock">{t('low_stock')}</option>
              <option value="Reorder Needed">{t('reorder_needed')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>{t('item_name')}</th>
              <th>{t('category')}</th>
              <th>{t('current_stock')}</th>
              <th>{t('reorder_level')}</th>
              <th>{t('status')}</th>
              <th>{t('last_ordered')}</th>
              <th>{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <tr key={item.id} className={`status-${item.status.replace(/\s+/g, '-').toLowerCase()}`}>
                  <td>{item.itemName}</td>
                  <td>{item.category}</td>
                  <td>{item.currentStock}</td>
                  <td>{item.reorderLevel}</td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(item.status)}
                      <span>{getTranslatedStatus(item.status)}</span>
                    </div>
                  </td>
                  <td>{new Date(item.lastOrdered).toLocaleDateString()}</td>
                  <td>
                    {item.reordered ? (
                      <button className="btn-reordered" disabled>
                        {t('ordered')} <FaCheckCircle />
                      </button>
                    ) : (
                      <button
                        className={`btn-reorder ${item.status === 'OK' ? 'disabled' : ''}`}
                        onClick={() => triggerReorder(item.id)}
                        disabled={item.status === 'OK'}
                      >
                        {t('reorder')} <FaChevronRight />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="no-results">
                <td colSpan={7}>
                  {t('no_items_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>{t('total_items')}</h3>
          <p>{reorders.length}</p>
        </div>
        <div className="summary-card warning">
          <h3>{t('low_stock')}</h3>
          <p>{reorders.filter(i => i.status === 'Low Stock').length}</p>
        </div>
        <div className="summary-card critical">
          <h3>{t('need_reorder')}</h3>
          <p>{reorders.filter(i => i.status === 'Reorder Needed').length}</p>
        </div>
      </div>
    </section>
  );
};

export default Reorders;