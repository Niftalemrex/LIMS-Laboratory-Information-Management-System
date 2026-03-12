import { useState } from 'react';
import { FiZap, FiCheck, FiPlus, FiSave } from 'react-icons/fi';
import './IntegrationsSettings.css';
import { useAppSettings } from '../contexts/AppSettingsContext'; // Adjust import path as needed

const IntegrationsSettings = () => {
  const { t } = useAppSettings();
  const [integrations, setIntegrations] = useState([
    { id: 'slack', name: t('slack'), connected: true },
    { id: 'google', name: t('google_workspace'), connected: true },
    { id: 'microsoft', name: t('microsoft_365'), connected: false },
    { id: 'zoom', name: t('zoom'), connected: false }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
  };

  return (
    <div className="integrations-container">
      <h1 className="settings-header"><FiZap /> {t('connected_apps')}</h1>

      <div className="integrations-grid">
        {integrations.map(integration => (
          <div
            key={integration.id}
            className={`integration-card ${integration.connected ? 'connected' : ''}`}
          >
            <div className="integration-logo">
              {integration.name
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()}
            </div>
            <div className="integration-details">
              <h3>{integration.name}</h3>
              <span className="status">
                {integration.connected ? t('connected') : t('not_connected')}
              </span>
            </div>
            <button
              className={`action-btn ${integration.connected ? 'disconnect' : 'connect'}`}
              onClick={() => toggleIntegration(integration.id)}
            >
              {integration.connected ? (
                <>
                  <FiCheck /> {t('connected')}
                </>
              ) : (
                <>
                  <FiPlus /> {t('connect')}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <button className="save-btn"><FiSave /> {t('save_integration_settings')}</button>
    </div>
  );
};

export default IntegrationsSettings;