import React, { useState } from 'react';
import { FiDownload, FiExternalLink, FiSearch, FiX } from 'react-icons/fi';
import './PatientGuides.css';

interface Guide {
  id: string;
  title: string;
  url: string;
  fileType: string;
  fileSize: string;
  category?: string;
  description?: string;
}

const GUIDES: Guide[] = [
  {
    id: 'guide-1',
    title: 'Getting Started with the Portal',
    url: '/guides/getting-started.pdf',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    category: 'Portal Basics',
    description: 'Learn how to navigate the patient portal and set up your account'
  },
  {
    id: 'guide-2',
    title: 'How to Book Appointments',
    url: '/guides/appointments.pdf',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    category: 'Appointments',
    description: 'Step-by-step guide to scheduling and managing your appointments'
  },
  {
    id: 'guide-3',
    title: 'Understanding Test Results',
    url: '/guides/results.pdf',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    category: 'Test Results',
    description: 'How to read and interpret your medical test results'
  },
  {
    id: 'guide-4',
    title: 'Telehealth Visit Guide',
    url: '/guides/telehealth.pdf',
    fileType: 'PDF',
    fileSize: '2.2 MB',
    category: 'Telehealth',
    description: 'Preparing for and participating in virtual visits'
  },
  {
    id: 'guide-5',
    title: 'Medication Management',
    url: '/guides/medications.pdf',
    fileType: 'PDF',
    fileSize: '1.5 MB',
    category: 'Medications',
    description: 'How to request refills and manage your prescriptions'
  },
  {
    id: 'guide-6',
    title: 'Billing and Insurance',
    url: '/guides/billing.pdf',
    fileType: 'PDF',
    fileSize: '2.7 MB',
    category: 'Billing',
    description: 'Understanding your bills and insurance coverage'
  }
];

const PatientGuides: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(GUIDES.map(guide => guide.category))];

  const filteredGuides = GUIDES.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         guide.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? guide.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  return (
    <main className="patient-guides-container">
      <header className="patient-guides-header">
        <h1>Patient Guides</h1>
        <p className="subtitle">
          Access helpful resources to manage your healthcare journey
        </p>
      </header>

      <div className="guides-controls">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search patient guides"
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
            All Guides
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

      <section aria-labelledby="guides-list-heading">
        <div className="guides-header">
          <h2 id="guides-list-heading">Available Guides</h2>
          <p className="results-count">
            Showing {filteredGuides.length} of {GUIDES.length} guides
            {(searchTerm || selectedCategory) && (
              <button onClick={clearFilters} className="clear-filters">
                Clear filters
              </button>
            )}
          </p>
        </div>

        {filteredGuides.length > 0 ? (
          <ul className="guides-grid">
            {filteredGuides.map((guide) => (
              <li key={guide.id} className="guide-card">
                <div className="guide-card-content">
                  <div className="guide-card-header">
                    <span className="guide-category">{guide.category}</span>
                    <span className="guide-file-info">
                      {guide.fileType} • {guide.fileSize}
                    </span>
                  </div>
                  <h3 className="guide-title">{guide.title}</h3>
                  <p className="guide-description">{guide.description}</p>
                  <div className="guide-actions">
                    <a
                      href={guide.url}
                      download
                      className="download-button"
                      aria-label={`Download ${guide.title}`}
                    >
                      <FiDownload /> Download
                    </a>
                    <a
                      href={guide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-button"
                      aria-label={`Open ${guide.title} in new tab`}
                    >
                      <FiExternalLink /> View
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-results">
            <p>No guides found matching your criteria.</p>
            <button onClick={clearFilters} className="clear-filters">
              Clear all filters
            </button>
          </div>
        )}
      </section>

      <section className="additional-help">
        <div className="help-card">
          <h3>Need personalized help?</h3>
          <p>
            Our support team is available to assist you with any questions about
            using the patient portal or accessing your health information.
          </p>
          <div className="help-actions">
            <button className="help-button primary">
              Contact Support
            </button>
            <button className="help-button secondary">
              Schedule a Tutorial
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PatientGuides;