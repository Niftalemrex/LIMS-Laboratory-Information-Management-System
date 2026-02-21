import React, { useState, useCallback } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './ManageCultures.css';

interface Culture {
  id: string;
  name: string;
  processingTime: string;
  price: number;
  active: boolean;
}

type CultureInput = Omit<Culture, 'id' | 'active'>;

const ManageCultures: React.FC = () => {
  const { t } = useAppSettings();
  const [cultures, setCultures] = useState<Culture[]>([
    { id: '1', name: 'Blood Culture', processingTime: '48-72 hours', price: 120, active: true },
    { id: '2', name: 'Urine Culture', processingTime: '24-48 hours', price: 85, active: true },
  ]);

  const [newCulture, setNewCulture] = useState<CultureInput>({
    name: '',
    processingTime: '',
    price: 0
  });

  const addCulture = useCallback(() => {
    if (newCulture.name.trim() && newCulture.processingTime.trim()) {
      setCultures(prev => [
        ...prev,
        {
          ...newCulture,
          id: Date.now().toString(),
          active: true
        }
      ]);
      setNewCulture({ name: '', processingTime: '', price: 0 });
    }
  }, [newCulture]);

  const toggleStatus = useCallback((id: string) => {
    setCultures(prev => prev.map(culture =>
      culture.id === id ? { ...culture, active: !culture.active } : culture
    ));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setNewCulture(prev => ({
        ...prev,
        [name]: name === 'price' ? Number(value) : value
      }));
    },
    []
  );

  return (
    <div className="manage-cultures" aria-labelledby="cultures-heading">
      <h3 id="cultures-heading">{t('manage_cultures')}</h3>
      
      <div className="add-culture-form" role="form" aria-labelledby="add-culture-heading">
        <h4 id="add-culture-heading">{t('add_new_culture')}</h4>
        <div className="form-group">
          <label htmlFor="culture-name">{t('culture_name')}</label>
          <input
            id="culture-name"
            type="text"
            name="name"
            placeholder={t('enter_culture_name')}
            value={newCulture.name}
            onChange={handleInputChange}
            required
            aria-required="true"
          />
        </div>
        <div className="form-group">
          <label htmlFor="processing-time">{t('processing_time')}</label>
          <input
            id="processing-time"
            type="text"
            name="processingTime"
            placeholder={t('processing_time_placeholder')}
            value={newCulture.processingTime}
            onChange={handleInputChange}
            required
            aria-required="true"
          />
        </div>
        <div className="form-group">
          <label htmlFor="culture-price">{t('price_dollar')}</label>
          <input
            id="culture-price"
            type="number"
            name="price"
            min="0"
            step="0.01"
            placeholder={t('enter_price')}
            value={newCulture.price}
            onChange={handleInputChange}
          />
        </div>
        <button 
          onClick={addCulture}
          disabled={!newCulture.name.trim() || !newCulture.processingTime.trim()}
          aria-disabled={!newCulture.name.trim() || !newCulture.processingTime.trim()}
        >
          {t('add_culture')}
        </button>
      </div>

      <div className="cultures-table-container">
        <table className="cultures-table" aria-label={t('list_of_cultures')}>
          <thead>
            <tr>
              <th scope="col">{t('culture_name')}</th>
              <th scope="col">{t('processing_time')}</th>
              <th scope="col">{t('price')}</th>
              <th scope="col">{t('status')}</th>
              <th scope="col">{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {cultures.map(culture => (
              <tr key={culture.id}>
                <td>{culture.name}</td>
                <td>{culture.processingTime}</td>
                <td>${culture.price.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${culture.active ? 'active' : 'inactive'}`}>
                    {culture.active ? t('active') : t('inactive')}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => toggleStatus(culture.id)}
                    aria-label={culture.active ? t('deactivate_culture') : t('activate_culture')}
                    className="status-toggle"
                  >
                    {culture.active ? t('deactivate') : t('activate')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCultures;