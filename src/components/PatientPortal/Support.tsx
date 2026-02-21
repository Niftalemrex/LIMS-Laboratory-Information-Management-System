import React, { useState } from 'react';
import { FiMail, FiPhone, FiMessageSquare, FiClock, FiChevronDown } from 'react-icons/fi';
import './Support.css';

interface ContactMethod {
  id: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  availability?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Support: React.FC = () => {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedMethod(prev => (prev === id ? null : id));
  };

  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      icon: <FiMail className="contact-icon" />,
      title: 'Email Support',
      value: 'support@healthcare.com',
      description: 'Get a response within 24 hours',
      action: {
        label: 'Compose Email',
        onClick: () => window.location.href = 'mailto:support@healthcare.com'
      }
    },
    {
      id: 'phone',
      icon: <FiPhone className="contact-icon" />,
      title: 'Phone Support',
      value: '+1 (800) 123-4567',
      availability: '24/7 Emergency Support',
      description: 'For urgent medical concerns'
    },
    {
      id: 'chat',
      icon: <FiMessageSquare className="contact-icon" />,
      title: 'Live Chat',
      value: 'Available in your patient portal',
      availability: 'Monday-Friday, 9 AM - 5 PM EST',
      description: 'Instant messaging with support staff',
      action: {
        label: 'Start Chat',
        onClick: () => console.log('Initiate chat')
      }
    }
  ];

  return (
    <main className="support-container">
      <header className="support-header">
        <h1>Contact Support</h1>
        <p className="support-subtitle">
          We're here to help you with any questions or issues you may encounter
        </p>
      </header>

      <div className="emergency-banner">
        <FiClock className="emergency-icon" />
        <p>For immediate medical emergencies, please call 911 or go to the nearest emergency room</p>
      </div>

      <div className="support-content-grid">
        <section className="contact-methods-section" aria-labelledby="contact-methods-heading">
          <h2 id="contact-methods-heading">Support Options</h2>
          <ul className="method-list">
            {contactMethods.map((method) => (
              <li key={method.id} className={`method-card ${expandedMethod === method.id ? 'expanded' : ''}`}>
                <div 
                  className="method-header"
                  onClick={() => toggleExpand(method.id)}
                  aria-expanded={expandedMethod === method.id}
                  aria-controls={`method-content-${method.id}`}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-title-group">
                    <h3 className="method-title">{method.title}</h3>
                    <p className="method-value">{method.value}</p>
                  </div>
                  <FiChevronDown className={`expand-icon ${expandedMethod === method.id ? 'expanded' : ''}`} />
                </div>
                
                <div 
                  id={`method-content-${method.id}`}
                  className="method-content"
                >
                  {method.availability && (
                    <p className="method-availability">
                      <FiClock className="availability-icon" />
                      {method.availability}
                    </p>
                  )}
                  <p className="method-description">{method.description}</p>
                  {method.action && (
                    <button 
                      className="action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        method.action?.onClick();
                      }}
                    >
                      {method.action.label}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="support-info-section">
          <div className="faq-cta">
            <h2>Frequently Asked Questions</h2>
            <p>Find quick answers to common questions in our knowledge base</p>
            <button className="secondary-button">Browse FAQs</button>
          </div>

          <div className="support-hours">
            <h3>Support Hours</h3>
            <ul className="hours-list">
              <li>
                <span className="hours-day">Monday - Friday</span>
                <span className="hours-time">9:00 AM - 5:00 PM EST</span>
              </li>
              <li>
                <span className="hours-day">Saturday</span>
                <span className="hours-time">10:00 AM - 2:00 PM EST</span>
              </li>
              <li>
                <span className="hours-day">Sunday</span>
                <span className="hours-time">Closed</span>
              </li>
            </ul>
          </div>

          <div className="support-tips">
            <h3>Quick Tips</h3>
            <ul className="tips-list">
              <li>Have your patient ID ready when calling</li>
              <li>Check your spam folder for email responses</li>
              <li>Live chat is fastest during business hours</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Support;