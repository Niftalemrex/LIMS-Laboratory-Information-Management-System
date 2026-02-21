import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch, FiX } from 'react-icons/fi';
import './FAQ.css';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  related?: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I book an appointment?',
    answer: 'You can book appointments through our patient portal. Navigate to the "Appointments" section and click "Schedule New Appointment". Choose your provider, preferred date and time, and reason for visit. You\'ll receive a confirmation email with all details.',
    category: 'Appointments',
    related: ['faq-2', 'faq-5']
  },
  {
    id: 'faq-2',
    question: 'Where can I see my test results?',
    answer: 'Test results are available in the "Health Records" section of your patient portal. Most results are available within 24-48 hours after processing. You\'ll receive a notification when new results are available. For sensitive results, your provider may release them after discussing with you.',
    category: 'Medical Records',
    related: ['faq-3', 'faq-7']
  },
  {
    id: 'faq-3',
    question: 'How do I contact support?',
    answer: 'Our support team is available through multiple channels:\n\n1. Phone: (800) 555-1234 (Mon-Fri, 8am-6pm)\n2. Secure messaging in the portal (24/7)\n3. Email: support@healthcare.com (response within 24 hours)\n4. Live chat during business hours\n\nFor urgent medical concerns, please call your provider directly.',
    category: 'Support',
    related: ['faq-1', 'faq-4']
  },
  {
    id: 'faq-4',
    question: 'What should I bring to my first appointment?',
    answer: 'For your first appointment, please bring:\n\n- Photo ID and insurance card\n- List of current medications\n- Medical history records\n- Any relevant test results\n- Payment method for any copay\n\nArrive 15 minutes early to complete paperwork.',
    category: 'Appointments',
    related: ['faq-1', 'faq-6']
  },
  {
    id: 'faq-5',
    question: 'How do I cancel or reschedule an appointment?',
    answer: 'You can cancel or reschedule appointments through the portal up to 24 hours before your scheduled time. Go to "My Appointments", select the appointment, and choose "Reschedule" or "Cancel". For cancellations within 24 hours, please call our office directly.',
    category: 'Appointments',
    related: ['faq-1', 'faq-4']
  },
  {
    id: 'faq-6',
    question: 'Is telehealth available?',
    answer: 'Yes, we offer telehealth visits for many appointment types. When scheduling, look for "Virtual Visit" options. You\'ll need a device with camera and microphone and our patient portal app installed. A secure link will be provided before your appointment.',
    category: 'Technology',
    related: ['faq-1', 'faq-3']
  },
  {
    id: 'faq-7',
    question: 'How do I request prescription refills?',
    answer: 'Prescription refills can be requested through the "Medications" section of your portal. Select the medication needing refill and submit your request. Most refills are processed within 48 hours. For controlled substances, please allow 3-5 business days.',
    category: 'Medications',
    related: ['faq-2', 'faq-5']
  }
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(FAQ_DATA.map(item => item.category))];

  const filteredFAQs = FAQ_DATA.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const toggleQuestion = (id: string) => {
    setActiveIndex(prev => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  return (
    <section className="faq-container" aria-labelledby="faq-title">
      <header className="faq-header">
        <h1 id="faq-title">Frequently Asked Questions</h1>
        <p className="faq-subtitle">Find answers to common questions about our services and patient portal</p>
      </header>

      <div className="faq-controls">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search FAQs"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="clear-search"
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="category-filters">
          <button
            className={`category-filter ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="faq-content">
        <div className="faq-results-info">
          <p>
            Showing {filteredFAQs.length} of {FAQ_DATA.length} questions
            {(searchTerm || selectedCategory) && (
              <button onClick={clearFilters} className="clear-filters">
                Clear filters
              </button>
            )}
          </p>
        </div>

        {filteredFAQs.length > 0 ? (
          <div className="faq-list" role="list">
            {filteredFAQs.map((item) => (
              <div 
                key={item.id} 
                className={`faq-item ${activeIndex === item.id ? 'active' : ''}`}
                role="listitem"
              >
                <button
                  className="faq-question"
                  onClick={() => toggleQuestion(item.id)}
                  aria-expanded={activeIndex === item.id}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span className="faq-question-text">{item.question}</span>
                  <span className="faq-icon" aria-hidden="true">
                    {activeIndex === item.id ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </button>
                
                {activeIndex === item.id && (
                  <div 
                    id={`faq-answer-${item.id}`}
                    className="faq-answer"
                    role="region"
                  >
                    <div className="answer-content">
                      {item.answer.split('\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                    
                    {item.related && item.related.length > 0 && (
                      <div className="related-questions">
                        <h4>Related Questions:</h4>
                        <ul>
                          {item.related.map(relatedId => {
                            const relatedItem = FAQ_DATA.find(faq => faq.id === relatedId);
                            return relatedItem ? (
                              <li key={relatedId}>
                                <button 
                                  onClick={() => {
                                    setActiveIndex(relatedItem.id);
                                    document.getElementById(`faq-question-${relatedItem.id}`)?.scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'nearest'
                                    });
                                  }}
                                  className="related-question-link"
                                >
                                  {relatedItem.question}
                                </button>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No FAQs found matching your criteria.</p>
            <button onClick={clearFilters} className="clear-filters">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="faq-footer">
        <p>Still have questions?</p>
        <div className="footer-actions">
          <button className="contact-button">
            Contact Support
          </button>
          <button className="feedback-button">
            Provide Feedback
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;