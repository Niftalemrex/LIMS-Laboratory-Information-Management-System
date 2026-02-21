import React, { useState } from 'react';
import { FiBell, FiMail, FiSmartphone, FiAlertCircle, FiSave } from 'react-icons/fi';
import './NotificationsSettings.css';
import { useAppSettings } from '../contexts/AppSettingsContext'; // Adjust import path as needed

const NotificationsSettings = () => {
  const { t } = useAppSettings();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    criticalAlerts: true
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="notifications-container">
      <h1 className="settings-header">
        <FiBell />
        {t('notification_preferences')}
      </h1>

      <div className="notification-list">
        {[
          {
            key: 'email',
            icon: <FiMail />,
            title: t('email_notifications'),
            desc: t('email_notifications_desc')
          },
          {
            key: 'push',
            icon: <FiSmartphone />,
            title: t('push_notifications'),
            desc: t('push_notifications_desc')
          },
          {
            key: 'sms',
            icon: <FiSmartphone />,
            title: t('sms_alerts'),
            desc: t('sms_alerts_desc')
          },
          {
            key: 'criticalAlerts',
            icon: <FiAlertCircle />,
            title: t('critical_alerts'),
            desc: t('critical_alerts_desc')
          }
        ].map(({ key, icon, title, desc }) => (
          <div className="notification-item" key={key}>
            <div className="notification-icon">{icon}</div>
            <div className="notification-details">
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications[key as keyof typeof notifications]}
                onChange={() => handleToggle(key as keyof typeof notifications)}
              />
              <span className="slider" />
            </label>
          </div>
        ))}
      </div>

      <button className="save-btn">
        <FiSave /> {t('save_preferences')}
      </button>
    </div>
  );
};

export default NotificationsSettings;