import React from 'react';
import './TestResults.css';

interface TestReport {
  id: number;
  testType: string;
  date: string;
  result: string;
  pdfUrl: string;
  comments?: string[];
}

const reports: TestReport[] = [
  {
    id: 1,
    testType: 'Blood Test',
    date: '2025-07-01',
    result: 'All parameters normal',
    pdfUrl: '/reports/blood-test-1.pdf',
    comments: [
      'Reviewed by Dr. Smith on 2025-07-02',
      'Patient advised to maintain healthy diet.',
    ],
  },
  {
    id: 2,
    testType: 'X-Ray',
    date: '2025-06-15',
    result: 'No abnormalities detected',
    pdfUrl: '/reports/xray-1.pdf',
    comments: [
      'Reviewed by Dr. Lee on 2025-06-16',
      'No follow-up needed.',
    ],
  },
];

const DownloadIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const TestResults: React.FC = () => {
  const downloadPdf = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareReport = (testType: string) => {
    alert(`Sharing ${testType} report - feature coming soon!`);
  };

  return (
    <section className="test-results-container">
      <h1 className="title">My Test Reports</h1>

      {reports.length === 0 ? (
        <p className="empty-message">No reports available.</p>
      ) : (
        <div className="report-grid" role="list">
          {reports.map((report) => (
            <article
              key={report.id}
              className="report-card"
              tabIndex={0}
              aria-label={`${report.testType} report`}
              role="listitem"
            >
              <header className="report-header">
                <h2 className="report-type">{report.testType}</h2>
                <time className="report-date" dateTime={report.date}>
                  {new Date(report.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </header>

              <p className="report-result">{report.result}</p>

              {report.comments && report.comments.length > 0 && (
                <section className="comments-section" aria-label="Comments">
                  <h3>Comments</h3>
                  <ul className="comments-list">
                    {report.comments.map((comment, index) => (
                      <li key={index} className="comment-item">
                        {comment}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="actions">
                <button
                  className="btn btn-download"
                  onClick={() => downloadPdf(report.pdfUrl)}
                  aria-label={`Download ${report.testType} PDF`}
                  type="button"
                  title="Download PDF"
                >
                  <DownloadIcon />
                </button>

                <button
                  className="btn btn-share"
                  onClick={() => shareReport(report.testType)}
                  aria-label={`Share ${report.testType} report`}
                  type="button"
                  title="Share report"
                >
                  <ShareIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default TestResults;
