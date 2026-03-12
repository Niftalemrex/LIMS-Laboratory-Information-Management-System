import { useState, useCallback } from 'react';
           // <-- type-only import
import { useAppSettings } from '../contexts/AppSettingsContext';
import './ManagePrices.css';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  lastUpdated: string;
}

const ManagePrices: React.FC = () => {
  const { t } = useAppSettings();                    // <-- let TypeScript infer
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Consultation', category: 'General', price: 100, lastUpdated: '2023-01-15' },
    { id: '2', name: 'ECG', category: 'Cardiology', price: 150, lastUpdated: '2023-02-20' },
    { id: '3', name: 'X-Ray', category: 'Radiology', price: 200, lastUpdated: '2023-03-10' },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const startEditing = useCallback((id: string, currentPrice: number) => {
    setEditingId(id);
    setEditPrice(currentPrice);
  }, []);

  const saveEdit = useCallback((id: string) => {
    setServices(prev =>
      prev.map(s =>
        s.id === id
          ? { 
              ...s, 
              price: editPrice, 
              lastUpdated: new Date().toISOString().split('T')[0] as string  // <-- ensure string
            }
          : s
      )
    );
    setEditingId(null);
  }, [editPrice]);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setEditPrice(isNaN(value) ? 0 : value);
  }, []);

  const filteredServices = services.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-prices-container">
      <header className="prices-header">
        <h1 className="prices-title">{t('service_price_management')}</h1>
        <div className="search-controls">
          <input
            type="text"
            placeholder={t('search_services')}
            className="search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label={t('search_services')}
          />
          <span className="result-count">
            {t('showing_services', )}
          </span>
        </div>
      </header>

      <div className="prices-table-container">
        <table className="prices-table" aria-label={t('service_price_list')}>
          <thead>
            <tr>
              <th>{t('service_name')}</th>
              <th>{t('category')}</th>
              <th>{t('price_dollar')}</th>
              <th>{t('last_updated')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <tr key={service.id} className={editingId === service.id ? 'editing-row' : ''}>
                  <td>{service.name}</td>
                  <td>
                    <span className="category-badge">{service.category}</span>
                  </td>
                  <td>
                    {editingId === service.id ? (
                      <div className="price-edit-container">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={handlePriceChange}
                          min={0}
                          step={0.01}
                          className="price-input"
                          aria-label={t('edit_price_for', )}
                        />
                        <span className="currency-symbol">$</span>
                      </div>
                    ) : (
                      <span className="price-display">${service.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td>
                    <time dateTime={service.lastUpdated}>
                      {new Date(service.lastUpdated).toLocaleDateString()}
                    </time>
                  </td>
                  <td className="action-buttons">
                    {editingId === service.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(service.id)}
                          className="save-button"
                          aria-label={t('save_new_price_for', )}
                        >
                          {t('save')}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="cancel-button"
                          aria-label={t('cancel_editing')}
                        >
                          {t('cancel')}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(service.id, service.price)}
                        className="edit-button"
                        aria-label={t('edit_price_for', )}
                      >
                        {t('edit')}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>{t('no_services_found')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagePrices;