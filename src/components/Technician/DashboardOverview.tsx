import React, { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiActivity, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiTrendingUp,
  FiRefreshCw,
  FiMoreHorizontal,
  FiArrowUpRight,
  FiClock
} from 'react-icons/fi';
import './DashboardOverview.css';
import { useAppSettings } from '../contexts/AppSettingsContext'; // Adjust the path as needed

interface DashboardCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  loading?: boolean;
}

const DashboardOverview: React.FC = () => {
  const { t } = useAppSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cards, setCards] = useState<{
    topCards: DashboardCard[];
    bottomCards: DashboardCard[];
  }>({
    topCards: [
      {
        title: t("today_samples"),
        value: "42",
        subtitle: t("collected_today"),
        icon: <FiPackage size={20} />,
        color: "#4F46E5",
        trend: 'up',
        change: '+12%'
      },
      {
        title: t("pending_tests"),
        value: "24",
        subtitle: t("waiting_processing"),
        icon: <FiActivity size={20} />,
        color: "#F59E0B",
        trend: 'down',
        change: '-3%'
      },
      {
        title: t("equipment_issues"),
        value: "5",
        subtitle: t("needs_maintenance"),
        icon: <FiAlertCircle size={20} />,
        color: "#EF4444",
        trend: 'neutral'
      },
    ],
    bottomCards: [
      {
        title: t("completed_today"),
        value: "18",
        subtitle: t("finished_tests"),
        icon: <FiCheckCircle size={20} />,
        color: "#10B981",
        trend: 'up',
        change: '+8%'
      },
      {
        title: t("personal_kpis"),
        value: "87%",
        subtitle: t("performance_score"),
        icon: <FiTrendingUp size={20} />,
        color: "#3B82F6",
        trend: 'up',
        change: '+2%'
      },
      {
        title: t("avg_turnaround"),
        value: "4.2h",
        subtitle: t("test_completion_time"),
        icon: <FiClock size={20} />,
        color: "#8B5CF6",
        trend: 'down',
        change: '-0.3h'
      },
    ]
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'equipment'>('overview');

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setCards(prev => ({
        topCards: prev.topCards.map(card => ({
          ...card,
          loading: false,
          value: Math.floor(Math.random() * 50).toString()
        })),
        bottomCards: prev.bottomCards.map(card => ({
          ...card,
          loading: false,
          value: card.title.includes('%') 
            ? `${Math.floor(Math.random() * 20) + 80}%`
            : card.title.includes(t("avg_turnaround").toLowerCase())
            ? `${(Math.random() * 2 + 3).toFixed(1)}h`
            : Math.floor(Math.random() * 30).toString()
        }))
      }));
      setIsRefreshing(false);
    }, 1500);
  };

  useEffect(() => {
    // Update card titles when language changes
    setCards({
      topCards: [
        {
          title: t("today_samples"),
          value: cards.topCards[0].value,
          subtitle: t("collected_today"),
          icon: <FiPackage size={20} />,
          color: "#4F46E5",
          trend: 'up',
          change: '+12%'
        },
        {
          title: t("pending_tests"),
          value: cards.topCards[1].value,
          subtitle: t("waiting_processing"),
          icon: <FiActivity size={20} />,
          color: "#F59E0B",
          trend: 'down',
          change: '-3%'
        },
        {
          title: t("equipment_issues"),
          value: cards.topCards[2].value,
          subtitle: t("needs_maintenance"),
          icon: <FiAlertCircle size={20} />,
          color: "#EF4444",
          trend: 'neutral'
        },
      ],
      bottomCards: [
        {
          title: t("completed_today"),
          value: cards.bottomCards[0].value,
          subtitle: t("finished_tests"),
          icon: <FiCheckCircle size={20} />,
          color: "#10B981",
          trend: 'up',
          change: '+8%'
        },
        {
          title: t("personal_kpis"),
          value: cards.bottomCards[1].value,
          subtitle: t("performance_score"),
          icon: <FiTrendingUp size={20} />,
          color: "#3B82F6",
          trend: 'up',
          change: '+2%'
        },
        {
          title: t("avg_turnaround"),
          value: cards.bottomCards[2].value,
          subtitle: t("test_completion_time"),
          icon: <FiClock size={20} />,
          color: "#8B5CF6",
          trend: 'down',
          change: '-0.3h'
        },
      ]
    });
  }, [t]);

  useEffect(() => {
    // Simulate initial loading
    setCards(prev => ({
      topCards: prev.topCards.map(card => ({ ...card, loading: true })),
      bottomCards: prev.bottomCards.map(card => ({ ...card, loading: true }))
    }));
    const timer = setTimeout(() => {
      setCards(prev => ({
        topCards: prev.topCards.map(card => ({ ...card, loading: false })),
        bottomCards: prev.bottomCards.map(card => ({ ...card, loading: false }))
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="dashboard-overview">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="overview-title">{t("lab_technician_dashboard")}</h1>
          <p className="overview-subtitle">
            {activeTab === 'overview' && t("overview_subtitle")}
            {activeTab === 'performance' && t("performance_subtitle")}
            {activeTab === 'equipment' && t("equipment_subtitle")}
          </p>
        </div>
        
        <div className="header-actions">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t("overview")}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              {t("performance")}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
              onClick={() => setActiveTab('equipment')}
            >
              {t("equipment")}
            </button>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <FiRefreshCw className={isRefreshing ? 'spin' : ''} />
            {isRefreshing ? t("refreshing") : t("refresh_data")}
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="metrics-section">
          <div className="metrics-row">
            {cards.topCards.map((card, i) => (
              <DashboardCard key={`top-${i}`} {...card} />
            ))}
          </div>
          
          <div className="metrics-row">
            {cards.bottomCards.map((card, i) => (
              <DashboardCard key={`bottom-${i}`} {...card} />
            ))}
          </div>
        </div>

        <div className="additional-widgets">
          <div className="widget productivity-widget">
            <div className="widget-header">
              <h3>{t("todays_productivity")}</h3>
              <button className="widget-action">
                <FiMoreHorizontal />
              </button>
            </div>
            <div className="productivity-meter">
              <div className="meter-bar" style={{ width: '72%' }} />
              <span className="meter-value">72% {t("efficiency")}</span>
            </div>
            <div className="productivity-comparison">
              <span className="comparison-value">
                <FiArrowUpRight /> 8% {t("better_than_yesterday")}
              </span>
            </div>
          </div>
          
          <div className="widget alerts-widget">
            <div className="widget-header">
              <h3>{t("priority_alerts")}</h3>
              <button className="widget-action">
                <FiMoreHorizontal />
              </button>
            </div>
            <ul className="alerts-list">
              <li className="alert-item critical">
                <span>{t("centrifuge_alert")}</span>
              </li>
              <li className="alert-item warning">
                <span>{t("analyzer_alert")}</span>
              </li>
              <li className="alert-item info">
                <span>{t("microscope_alert")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const DashboardCard: React.FC<DashboardCard> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  trend, 
  change,
  loading 
}) => {
  return (
    <div className="dashboard-card">
      <div className="card-icon-container" style={{ backgroundColor: `${color}1A` }}>
        <div className="card-icon" style={{ color }}>
          {icon}
        </div>
      </div>
      
      <div className="card-content">
        <p className="card-title">{title}</p>
        {loading ? (
          <div className="card-value-loading" />
        ) : (
          <p className="card-value">{value}</p>
        )}
        <div className="card-footer">
          <p className="card-subtitle">{subtitle}</p>
          {trend && change && (
            <span className={`trend-indicator ${trend}`}>
              {change} {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;