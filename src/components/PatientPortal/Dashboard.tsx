import React from 'react';
import './Dashboard.css';

interface ResultStatus {
  id: number;
  testName: string;
  status: 'Pending' | 'Completed';
  date: string;
}

interface Appointment {
  id: number;
  with: string;
  dateTime: string;
  location: string;
}

const mockResults: ResultStatus[] = [
  { id: 1, testName: 'Blood Test', status: 'Pending', date: '2025-07-20' },
  { id: 2, testName: 'X-Ray', status: 'Completed', date: '2025-07-15' },
  { id: 3, testName: 'MRI Scan', status: 'Pending', date: '2025-07-22' },
];

const mockAppointments: Appointment[] = [
  { id: 1, with: 'Dr. Smith', dateTime: '2025-07-23 10:00 AM', location: 'Room 201' },
  { id: 2, with: 'Dr. Adams', dateTime: '2025-07-25 2:30 PM', location: 'Room 102' },
];

const Dashboard: React.FC = () => {
  return (
    <section className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to your dashboard!</h1>
        <p className="dashboard-subtitle">
          Use the sidebar to navigate through your tools and analytics.
        </p>
      </header>

      <div className="dashboard-sections">

        <section className="results-section card">
          <h2>Result Status</h2>
          <ul className="results-list">
            {mockResults.map(result => (
              <li key={result.id} className={`result-item ${result.status.toLowerCase()}`}>
                <span className="result-test">{result.testName}</span>
                <span className="result-date">{result.date}</span>
                <span className="result-status">{result.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="appointments-section card">
          <h2>Appointment Reminders</h2>
          {mockAppointments.length > 0 ? (
            <ul className="appointments-list">
              {mockAppointments.map(appt => (
                <li key={appt.id} className="appointment-item">
                  <p><strong>With:</strong> {appt.with}</p>
                  <p><strong>Date & Time:</strong> {appt.dateTime}</p>
                  <p><strong>Location:</strong> {appt.location}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </section>

      </div>
    </section>
  );
};

export default Dashboard;
