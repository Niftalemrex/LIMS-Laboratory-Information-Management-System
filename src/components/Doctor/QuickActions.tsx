import React from 'react';
import { 
  FaFlask, 
  FaChartLine, 
  FaFileMedical, 
  FaUserPlus, 
  FaCalendarAlt, 
  FaPrescriptionBottleAlt,
  FaChevronRight
} from 'react-icons/fa';
import { MdOutlineMedicalServices } from 'react-icons/md';
import './QuickActions.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
  color: string;
}

const QuickActions: React.FC = () => {
  const { t } = useAppSettings();

  const quickActions: QuickAction[] = [
    {
      id: 'request-test',
      icon: <FaFlask size={24} />,
      label: t('request_test'),
      description: t('order_lab_tests'),
      action: () => handleAction('request-test'),
      color: '#6366F1'
    },
    {
      id: 'review-result',
      icon: <FaChartLine size={24} />,
      label: t('review_results'),
      description: t('view_test_results'),
      action: () => handleAction('review-result'),
      color: '#10B981'
    },
    {
      id: 'add-note',
      icon: <FaFileMedical size={24} />,
      label: t('add_note'),
      description: t('document_encounter'),
      action: () => handleAction('add-note'),
      color: '#3B82F6'
    },
    {
      id: 'new-patient',
      icon: <FaUserPlus size={24} />,
      label: t('new_patient'),
      description: t('register_patient'),
      action: () => handleAction('new-patient'),
      color: '#F59E0B'
    },
    {
      id: 'schedule',
      icon: <FaCalendarAlt size={24} />,
      label: t('schedule'),
      description: t('book_appointments'),
      action: () => handleAction('schedule'),
      color: '#EC4899'
    },
    {
      id: 'prescriptions',
      icon: <FaPrescriptionBottleAlt size={24} />,
      label: t('prescriptions'),
      description: t('issue_medications'),
      action: () => handleAction('prescriptions'),
      color: '#8B5CF6'
    },
    {
      id: 'procedures',
      icon: <MdOutlineMedicalServices size={24} />,
      label: t('procedures'),
      description: t('record_procedures'),
      action: () => handleAction('procedures'),
      color: '#EF4444'
    },
  ];

  const handleAction = (actionId: string) => {
    console.log(`Action triggered: ${actionId}`);
    // TODO: Implement actual action handlers
    // This could open modals, navigate to pages, etc.
  };

  return (
    <section className="quick-actions-container">
      <div className="qa-header">
        <h2 className="qa-title">{t('quick_actions')}</h2>
        <p className="qa-subtitle">{t('quick_actions_subtitle')}</p>
      </div>

      <div className="qa-grid">
        {quickActions.map(({ id, icon, label, description, action, color }) => (
          <div 
            key={id} 
            className="qa-card"
            onClick={action}
            style={{ '--card-color': color } as React.CSSProperties}
          >
            <div className="qa-icon-container" style={{ backgroundColor: `${color}10` }}>
              <div className="qa-icon" style={{ color }}>
                {icon}
              </div>
            </div>
            <div className="qa-content">
              <h3 className="qa-label">{label}</h3>
              <p className="qa-description">{description}</p>
            </div>
            <div className="qa-arrow">
              <FaChevronRight className="arrow-icon" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;