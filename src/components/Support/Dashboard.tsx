import React from 'react';
import { Boxes, Clock, AlertTriangle, Truck, ChevronRight } from 'lucide-react';
import './Dashboard.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: 'green' | 'yellow' | 'red' | 'blue';
}

interface ActivityItemProps {
  type: 'success' | 'warning' | 'danger' | 'info';
  message: string;
  timestamp?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  const { t } = useAppSettings();
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">
        {icon}
      </div>
      <div className="stat-card__content">
        <h3 className="stat-card__title">{t(title)}</h3>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<ActivityItemProps> = ({ type, message, timestamp }) => {
  const { t } = useAppSettings();
  const getTranslatedType = () => {
    switch (type) {
      case 'success': return t('success');
      case 'warning': return t('warning');
      case 'danger': return t('danger');
      case 'info': return t('info');
      default: return type;
    }
  };

  return (
    <li className="activity-item">
      <span className={`activity-item__tag activity-item__tag--${type}`}>
        {getTranslatedType()}
      </span>
      <div className="activity-item__content">
        <p className="activity-item__message">{t(message)}</p>
        {timestamp && <p className="activity-item__timestamp">{timestamp}</p>}
      </div>
      <ChevronRight className="activity-item__chevron" size={16} />
    </li>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useAppSettings();
  
  const activityData: ActivityItemProps[] = [
    { 
      type: 'warning', 
      message: 'latex_gloves_warning', 
      timestamp: t('hours_ago', { count: 2 }) 
    },
    { 
      type: 'success', 
      message: 'syringes_received', 
      timestamp: t('date_format', { month: 'Jul', day: 20, year: 2023 }) 
    },
    { 
      type: 'danger', 
      message: 'alcohol_swabs_expire', 
      timestamp: t('day_ago', { count: 1 }) 
    },
    { 
      type: 'info', 
      message: 'n95_masks_pending', 
      timestamp: t('days_ago', { count: 3 }) 
    },
    { 
      type: 'success', 
      message: 'paracetamol_confirmed', 
      timestamp: t('hours_ago', { count: 5 }) 
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">{t('inventory_dashboard')}</h1>
        <p className="dashboard__subtitle">
          {t('dashboard_subtitle')}
        </p>
      </header>

      <div className="dashboard__stats">
        <StatCard
          icon={<Boxes size={20} />}
          title="inventory_status"
          value={t('items_in_stock', { count: 145 })}
          color="green"
        />
        <StatCard
          icon={<Clock size={20} />}
          title="expiring_soon"
          value={t('items_within_days', { count: 6, days: 7 })}
          color="yellow"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          title="reorder_needed"
          value={t('critical_stock_items', { count: 4 })}
          color="red"
        />
        <StatCard
          icon={<Truck size={20} />}
          title="recent_deliveries"
          value={t('shipments_this_week', { count: 3 })}
          color="blue"
        />
      </div>

      <section className="dashboard__activity">
        <div className="activity-header">
          <h2 className="activity-title">{t('inventory_activity')}</h2>
          <button className="activity-view-all">
            {t('view_all_activity')}
          </button>
        </div>
        <ul className="activity-list">
          {activityData.map((item, index) => (
            <ActivityItem
              key={index}
              type={item.type}
              message={item.message}
              timestamp={item.timestamp}
            />
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;