import React, { useState, useEffect } from 'react';
import './DashboardHome.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

// Icons
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiClock,
  FiMessageSquare,
  FiEdit,
  FiActivity,
  FiUser,
  FiCalendar,
  FiBarChart2
} from 'react-icons/fi';
import { FaRegBell, FaRegStickyNote } from 'react-icons/fa';

// Types
type TestResult = {
  id: number;
  patient: string;
  test: string;
  date: string;
  status: 'Pending' | 'Reviewed' | 'Urgent';
};

type PatientInsight = {
  id: number;
  insight: string;
  patientId: number;
  patientName: string;
  priority: 'low' | 'medium' | 'high';
};

type Activity = {
  id: number;
  activity: string;
  time: string;
  type: 'review' | 'update' | 'message' | 'notification';
};

const DashboardHome: React.FC = () => {
  const { t } = useAppSettings();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [patientInsights, setPatientInsights] = useState<PatientInsight[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const testData: TestResult[] = [
          { id: 1, patient: 'John Doe', test: 'Complete Blood Count', date: '2025-07-18', status: 'Pending' },
          { id: 2, patient: 'Jane Smith', test: 'Chest X-Ray', date: '2025-07-17', status: 'Pending' },
          { id: 3, patient: 'Robert Johnson', test: 'MRI Brain Scan', date: '2025-07-16', status: 'Urgent' },
        ];

        const insightsData: PatientInsight[] = [
          { id: 1, insight: 'Patient shows improvement in blood pressure', patientId: 101, patientName: 'Patient A', priority: 'low' },
          { id: 2, insight: 'Patient requires follow-up in 2 weeks', patientId: 102, patientName: 'Patient B', priority: 'medium' },
          { id: 3, insight: 'Critical lab values detected', patientId: 103, patientName: 'Patient C', priority: 'high' },
        ];

        const activityData: Activity[] = [
          { id: 1, activity: 'Reviewed MRI results for Patient C', time: '2 hours ago', type: 'review' },
          { id: 2, activity: 'Updated medication for Patient D', time: 'Yesterday', type: 'update' },
          { id: 3, activity: 'Received message from Patient E', time: '3 days ago', type: 'message' },
        ];

        setTestResults(testData);
        setPatientInsights(insightsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReviewTest = (id: number) => {
    setTestResults(prev => 
      prev.map(test => 
        test.id === id ? { ...test, status: 'Reviewed' } : test
      )
    );
  };

  const getPriorityColor = (priority: PatientInsight['priority']) => {
    switch (priority) {
      case 'high': return 'var(--error-color)';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--muted-color)';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'Pending': return 'var(--warning-color)';
      case 'Reviewed': return 'var(--success-color)';
      case 'Urgent': return 'var(--error-color)';
      default: return 'var(--muted-color)';
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'review': return <FiBarChart2 className="activity-icon" />;
      case 'update': return <FiEdit className="activity-icon" />;
      case 'message': return <FiMessageSquare className="activity-icon" />;
      case 'notification': return <FaRegBell className="activity-icon" />;
      default: return <FiActivity className="activity-icon" />;
    }
  };

  if (isLoading) {
    return (
      <div className="card loading-card">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('loading_dashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1 className="card-title">{t('doctor_dashboard')}</h1>
        <p className="card-subtitle">{t('welcome_back_message')}</p>
      </div>

      <div className="dashboard-grid">
        {/* Test Results Card */}
        <div className="card test-results-card">
          <div className="card-header">
            <h2 className="card-title">
              <FiActivity className="card-icon" />
              {t('test_results_needing_review')}
            </h2>
            <span className="badge">
              {testResults.filter(t => t.status !== 'Reviewed').length}
            </span>
          </div>
          
          <div className="card-body">
            {testResults.length === 0 ? (
              <p className="no-data">{t('no_test_results')}</p>
            ) : (
              <ul className="card-list">
                {testResults.map(({ id, patient, test, date, status }) => (
                  <li key={id} className="card-list-item">
                    <div className="item-content">
                      <div className="item-main">
                        <FiUser className="item-icon" />
                        <div>
                          <h3>{patient}</h3>
                          <p>{test}</p>
                        </div>
                      </div>
                      <div className="item-meta">
                        <span>{new Date(date).toLocaleDateString()}</span>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(status) }}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                    {status !== 'Reviewed' && (
                      <button 
                        onClick={() => handleReviewTest(id)}
                        className="action-button"
                      >
                        {status === 'Urgent' ? (
                          <>
                            <FiAlertTriangle /> {t('review_now')}
                          </>
                        ) : (
                          <>
                            <FiCheckCircle /> {t('review')}
                          </>
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Patient Insights Card */}
        <div className="card insights-card">
          <div className="card-header">
            <h2 className="card-title">
              <FaRegStickyNote className="card-icon" />
              {t('patient_insights')}
            </h2>
          </div>
          
          <div className="card-body">
            {patientInsights.length === 0 ? (
              <p className="no-data">{t('no_insights')}</p>
            ) : (
              <ul className="card-list">
                {patientInsights.map(({ id, insight, patientName, priority }) => (
                  <li key={id} className="card-list-item">
                    <div 
                      className="priority-indicator" 
                      style={{ backgroundColor: getPriorityColor(priority) }}
                    />
                    <div className="item-content">
                      <div className="item-main">
                        <h3>{patientName}</h3>
                        <p>{insight}</p>
                      </div>
                      <div className="item-meta">
                        <span className={`priority-tag priority-${priority}`}>
                          {priority} priority
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="card activity-card">
          <div className="card-header">
            <h2 className="card-title">
              <FiClock className="card-icon" />
              {t('recent_activity')}
            </h2>
          </div>
          
          <div className="card-body">
            {recentActivity.length === 0 ? (
              <p className="no-data">{t('no_activity')}</p>
            ) : (
              <ul className="card-list">
                {recentActivity.map(({ id, activity, time, type }) => (
                  <li key={id} className={`card-list-item activity-${type}`}>
                    {getActivityIcon(type)}
                    <div className="item-content">
                      <p>{activity}</p>
                      <span className="activity-time">{time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;