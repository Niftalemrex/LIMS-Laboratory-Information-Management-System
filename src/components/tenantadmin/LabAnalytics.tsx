import React, { useState} from 'react';
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiClock, 
  FiAlertCircle, 
  FiDownload,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './LabAnalytics.css';

interface TestVolumeData {
  month: string;
  count: number;
  trend: 'up' | 'down' | 'neutral';
}

interface SuccessRateData {
  test: string;
  success: number;
  avgTime: string;
  failures: number;
  trend: 'up' | 'down' | 'neutral';
}

interface TurnaroundData {
  test: string;
  avgTime: string;
  targetTime: string;
  compliance: number;
}

const LabAnalytics: React.FC = () => {
  const { t } = useAppSettings();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '12m'>('12m');
  const [isLoading, setIsLoading] = useState(false);
  const [activeChart, setActiveChart] = useState<'volume' | 'success' | 'turnaround'>('volume');

  const monthlyTests: TestVolumeData[] = [
    { month: 'Jan', count: 120, trend: 'up' },
    { month: 'Feb', count: 98, trend: 'down' },
    { month: 'Mar', count: 135, trend: 'up' },
    { month: 'Apr', count: 150, trend: 'up' },
    { month: 'May', count: 170, trend: 'up' },
    { month: 'Jun', count: 160, trend: 'down' },
    { month: 'Jul', count: 185, trend: 'up' },
    { month: 'Aug', count: 210, trend: 'up' },
    { month: 'Sep', count: 195, trend: 'down' },
    { month: 'Oct', count: 220, trend: 'up' },
    { month: 'Nov', count: 230, trend: 'up' },
    { month: 'Dec', count: 250, trend: 'up' },
  ];

  const testSuccessRates: SuccessRateData[] = [
    { test: 'Complete Blood Count', success: 98.5, avgTime: '2.5h', failures: 12, trend: 'up' },
    { test: 'Lipid Panel', success: 95.2, avgTime: '3h', failures: 24, trend: 'neutral' },
    { test: 'Liver Function', success: 96.8, avgTime: '4h', failures: 18, trend: 'up' },
    { test: 'Thyroid Stimulating', success: 97.1, avgTime: '5h', failures: 15, trend: 'down' },
    { test: 'Hemoglobin A1C', success: 99.0, avgTime: '2h', failures: 5, trend: 'up' },
  ];

  const turnaroundTimes: TurnaroundData[] = [
    { test: 'CBC', avgTime: '2.5h', targetTime: '4h', compliance: 98 },
    { test: 'BMP', avgTime: '3.2h', targetTime: '6h', compliance: 95 },
    { test: 'Lipid Panel', avgTime: '4.1h', targetTime: '6h', compliance: 92 },
    { test: 'Liver Panel', avgTime: '5.5h', targetTime: '8h', compliance: 89 },
    { test: 'Thyroid Test', avgTime: '6.8h', targetTime: '8h', compliance: 85 },
  ];

  const stats = [
    { 
      title: t('total_tests'), 
      value: '2,458', 
      change: '+12%', 
      trend: 'up',
      icon: <FiBarChart2 className="stat-icon" />
    },
    { 
      title: t('success_rate'), 
      value: '97.2%', 
      change: '+0.8%', 
      trend: 'up',
      icon: <FiTrendingUp className="stat-icon" />
    },
    { 
      title: t('avg_turnaround'), 
      value: '4.2h', 
      change: '-0.3h', 
      trend: 'up',
      icon: <FiClock className="stat-icon" />
    },
    { 
      title: t('critical_failures'), 
      value: '8', 
      change: '-2', 
      trend: 'down',
      icon: <FiAlertCircle className="stat-icon" />
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const maxTestCount = Math.max(...monthlyTests.map(item => item.count));

  return (
    <section className="lab-analytics">
      <div className="analytics-header card">
        <div className="header-content">
          <h1>{t('laboratory_analytics_dashboard')}</h1>
          <p className="subtitle">
            {t('comprehensive_performance_metrics')}
          </p>
        </div>
        <div className="header-actions">
          <div className="time-filter">
            <FiFilter className="filter-icon" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              disabled={isLoading}
              aria-label={t('select_time_range')}
            >
              <option value="7d">{t('last_7_days')}</option>
              <option value="30d">{t('last_30_days')}</option>
              <option value="90d">{t('last_90_days')}</option>
              <option value="12m">{t('last_12_months')}</option>
            </select>
          </div>
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label={t('refresh_data')}
          >
            <FiRefreshCw className={isLoading ? 'spin' : ''} />
            {isLoading ? t('refreshing') : t('refresh_data')}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon-container">
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-title">{stat.title}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-change ${stat.trend}`}>
                {stat.change} {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-nav card">
        <button 
          className={`nav-btn ${activeChart === 'volume' ? 'active' : ''}`}
          onClick={() => setActiveChart('volume')}
          aria-label={t('view_test_volume')}
        >
          <FiBarChart2 /> {t('test_volume')}
        </button>
        <button 
          className={`nav-btn ${activeChart === 'success' ? 'active' : ''}`}
          onClick={() => setActiveChart('success')}
          aria-label={t('view_success_rates')}
        >
          <FiTrendingUp /> {t('success_rates')}
        </button>
        <button 
          className={`nav-btn ${activeChart === 'turnaround' ? 'active' : ''}`}
          onClick={() => setActiveChart('turnaround')}
          aria-label={t('view_turnaround_times')}
        >
          <FiClock /> {t('turnaround_times')}
        </button>
      </div>

      <div className="chart-container card">
        {activeChart === 'volume' && (
          <div className="volume-chart">
            <div className="chart-header">
              <h2>{t('monthly_test_volume')}</h2>
              <button className="export-btn" aria-label={t('export_data')}>
                <FiDownload /> {t('export')}
              </button>
            </div>
            <div className="bars-container">
              {monthlyTests.map(({ month, count, trend }) => (
                <div key={month} className="bar-group">
                  <div 
                    className="bar" 
                    style={{ height: `${(count / maxTestCount) * 100}%` }}
                    aria-label={`${count} ${t('tests_in')} ${month}`}
                  >
                    <div className="bar-value">{count}</div>
                    <div className={`trend-indicator ${trend}`}>
                      {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                    </div>
                  </div>
                  <span className="month-label">{month}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeChart === 'success' && (
          <div className="success-chart">
            <div className="chart-header">
              <h2>{t('test_success_rates')}</h2>
              <button className="export-btn" aria-label={t('export_data')}>
                <FiDownload /> {t('export')}
              </button>
            </div>
            <div className="success-list">
              {testSuccessRates.map(({ test, success, avgTime, failures, trend }) => (
                <div key={test} className="success-item">
                  <div className="test-info">
                    <span className="test-name">{test}</span>
                    <span className="test-meta">{avgTime} {t('avg')} • {failures} {t('failures')}</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${success}%` }}
                      />
                    </div>
                    <span className={`success-percent ${trend}`}>
                      {success}% {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeChart === 'turnaround' && (
          <div className="turnaround-chart">
            <div className="chart-header">
              <h2>{t('test_turnaround_times')}</h2>
              <button className="export-btn" aria-label={t('export_data')}>
                <FiDownload /> {t('export')}
              </button>
            </div>
            <div className="compliance-grid">
              {turnaroundTimes.map(({ test, avgTime, targetTime, compliance }) => (
                <div key={test} className="compliance-item">
                  <div className="test-header">
                    <span className="test-name">{test}</span>
                    <span className="time-difference">
                      {avgTime} / {targetTime}
                    </span>
                  </div>
                  <div className="compliance-bar">
                    <div 
                      className="compliance-fill" 
                      style={{ width: `${compliance}%` }}
                    />
                    <span className="compliance-label">{compliance}% {t('compliance')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LabAnalytics;