import React, { useState, useEffect } from 'react';
import { FiZap, FiCheck, FiPlus, FiSave } from 'react-icons/fi';
import './IntegrationsSettings.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

export interface Integration {
  id: string;
  name: string;
  connected: boolean;
  category: 'meeting' | 'database' | 'project' | 'other';
}

// LocalStorage keys
const CATEGORY_KEY = 'integrationCategories';
const CONNECTED_KEY = 'integrationConnected';

const IntegrationsSettings: React.FC = () => {
  const { t } = useAppSettings();

  const defaultIntegrations: Integration[] = [
    // Meeting apps
    { id: 'slack', name: t('slack'), connected: true, category: 'meeting' },
    { id: 'google_meet', name: t('google_workspace'), connected: true, category: 'meeting' },
    { id: 'microsoft_365', name: t('microsoft_365'), connected: false, category: 'meeting' },
    { id: 'zoom', name: t('zoom'), connected: false, category: 'meeting' },

    // Database apps
    { id: 'aws_s3', name: t('aws_s3'), connected: true, category: 'database' },
    { id: 'dropbox', name: t('dropbox'), connected: false, category: 'database' },
    { id: 'google_drive', name: t('google_drive'), connected: false, category: 'database' },
    { id: 'local_pc', name: t('local_download'), connected: true, category: 'database' },

    // Project management
    { id: 'github', name: t('github'), connected: false, category: 'project' },
    { id: 'gitlab', name: t('gitlab'), connected: false, category: 'project' },
    { id: 'asana', name: t('asana'), connected: false, category: 'project' },
    { id: 'jira', name: t('jira'), connected: false, category: 'project' },
    { id: 'trello', name: t('trello'), connected: false, category: 'project' },
    { id: 'notion', name: t('notion'), connected: false, category: 'project' },

    // Other apps
    { id: 'other_app', name: t('other_app'), connected: false, category: 'other' }
  ];

  const [integrations, setIntegrations] = useState<Integration[]>([]);

  // Load from localStorage or defaults
  useEffect(() => {
    const savedCategories = localStorage.getItem(CATEGORY_KEY);
    const savedConnected = localStorage.getItem(CONNECTED_KEY);

    if (savedCategories && savedConnected) {
      const categories = JSON.parse(savedCategories); // { id: category }
      const connected = JSON.parse(savedConnected);   // { id: connected boolean }

      const loaded = defaultIntegrations.map(i => ({
        ...i,
        category: categories[i.id] || i.category,
        connected: connected[i.id] ?? i.connected
      }));
      setIntegrations(loaded);
    } else {
      setIntegrations(defaultIntegrations);
    }
  }, []);

  // Toggle connection status
  const toggleIntegration = (id: string) => {
    setIntegrations(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i);

      // Save to localStorage on each toggle
      const categoriesObj = Object.fromEntries(updated.map(i => [i.id, i.category]));
      const connectedObj = Object.fromEntries(updated.map(i => [i.id, i.connected]));

      localStorage.setItem(CATEGORY_KEY, JSON.stringify(categoriesObj));
      localStorage.setItem(CONNECTED_KEY, JSON.stringify(connectedObj));

      return updated;
    });
  };

  const saveIntegrations = () => {
    const categoriesObj = Object.fromEntries(integrations.map(i => [i.id, i.category]));
    const connectedObj = Object.fromEntries(integrations.map(i => [i.id, i.connected]));

    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categoriesObj));
    localStorage.setItem(CONNECTED_KEY, JSON.stringify(connectedObj));
    alert(t('integration_settings_saved'));
  };

  const categories: { key: Integration['category']; label: string }[] = [
    { key: 'meeting', label: t('meeting_apps') },
    { key: 'database', label: t('database_apps') },
    { key: 'project', label: t('project_apps') },
    { key: 'other', label: t('other_apps') }
  ];

  const integrationsByCategory = (category: Integration['category']) =>
    integrations.filter(i => i.category === category);

  return (
    <div className="integrations-container">
      <h1 className="settings-header"><FiZap /> {t('connected_apps')}</h1>

      {categories.map(cat => {
        const items = integrationsByCategory(cat.key);
        if (!items.length) return null;

        return (
          <div key={cat.key} className="integration-category">
            <h2 className="category-title">{cat.label}</h2>
            <div className="integrations-grid">
              {items.map(integration => (
                <div
                  key={integration.id}
                  className={`integration-card ${integration.connected ? 'connected' : ''}`}
                >
                  <div className="integration-logo">
                    {integration.name.split(' ').map(w => w.charAt(0)).join('').toUpperCase()}
                  </div>
                  <div className="integration-details">
                    <h3>{integration.name}</h3>
                    <span className="status">{integration.connected ? t('connected') : t('not_connected')}</span>
                  </div>
                  <button
                    className={`action-btn ${integration.connected ? 'disconnect' : 'connect'}`}
                    onClick={() => toggleIntegration(integration.id)}
                  >
                    {integration.connected ? <><FiCheck /> {t('connected')}</> : <><FiPlus /> {t('connect')}</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <button className="save-btn" onClick={saveIntegrations}><FiSave /> {t('save_integration_settings')}</button>
    </div>
  );
};

export default IntegrationsSettings;
