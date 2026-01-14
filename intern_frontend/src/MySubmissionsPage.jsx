import React, { useState, useEffect } from 'react';
import './MySubmissionsPage.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MySubmissionsPage = () => {
  const [data, setData] = useState({ submissions: [], reviews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your submissions.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/submissions/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData({
          submissions: response.data.submissions || [],
          reviews: response.data.reviews || [],
        });
      } catch (err) {
        console.error('Fetch Error:', err.response?.data || err.message);
        setError('Failed to load submissions and reviews: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadPdf = async (submissionId, companyName) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3000/submissions/${submissionId}/download-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // important for PDF
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Internship_${companyName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('PDF Download Error:', err.response?.data || err.message);
      alert('Failed to download PDF.');
    }
  };

  if (loading) return <p className="ms-loading">Loading...</p>;
  if (error) return <p className="ms-error">{error}</p>;

  const accepted = data.submissions.filter((s) => s.status === 'accepted');
  const declined = data.submissions.filter((s) => s.status === 'declined');
  const pending = data.submissions.filter((s) => s.status === 'pending');

  return (
    <div className="ms-app-container">
      <header className="ms-header">
        <div className="ms-img-container">
          <img src="/assets/logo1.webp" alt="logo" />
          <h1>PSG TECH</h1>
        </div>
        <Link to="/studentpage" className="ms-home-button">Home</Link>
      </header>

      <main className="ms-main-content">
        <div className="ms-submissions-reviews-container">

          {/* Accepted Submissions */}
          <div className="ms-submissions-panel">
            <h2 className="ms-submissions-title">Accepted Submissions</h2>
            {accepted.length === 0 ? (
              <p className="ms-no-data">No accepted submissions found.</p>
            ) : (
              <ul className="ms-submissions-list">
                {accepted.map((submission) => (
                  <li key={submission.id} className="ms-submission-item">
                    <div onClick={() => setSelectedSubmission(submission)}>
                      <span className="ms-submission-title">{submission.company_name}</span>
                      <span className="ms-submission-date">
                        {submission.start_date} to {submission.end_date}
                      </span>
                    </div>
                    <button
                      className="ms-download-button"
                      onClick={() => downloadPdf(submission.id, submission.company_name)}
                    >
                      Download PDF
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Declined Submissions */}
          <div className="ms-submissions-panel">
            <h2 className="ms-submissions-title">Declined Submissions</h2>
            {declined.length === 0 ? (
              <p className="ms-no-data">No declined submissions found.</p>
            ) : (
              <ul className="ms-submissions-list">
                {declined.map((submission) => (
                  <li
                    key={submission.id}
                    className="ms-submission-item"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <span className="ms-submission-title">{submission.company_name}</span>
                    <span className="ms-submission-date">
                      {submission.start_date} to {submission.end_date}
                    </span>
                    <span className="ms-review-remarks">
                      Remarks: {submission.remarks || 'No remarks'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending Submissions */}
          <div className="ms-submissions-panel">
            <h2 className="ms-submissions-title">Pending Submissions</h2>
            {pending.length === 0 ? (
              <p className="ms-no-data">No pending submissions found.</p>
            ) : (
              <ul className="ms-submissions-list">
                {pending.map((submission) => (
                  <li
                    key={submission.id}
                    className="ms-submission-item"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <span className="ms-submission-title">{submission.company_name}</span>
                    <span className="ms-submission-date">
                      {submission.start_date} to {submission.end_date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <footer className="ms-footer">© 2025 PSG TECH</footer>

      {selectedSubmission && (
        <div className="ms-modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="ms-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="ms-modal-title">Submission Details</h3>
            <p><strong>Company:</strong> {selectedSubmission.company_name}</p>
            <p><strong>Role:</strong> {selectedSubmission.role}</p>
            <p><strong>Start Date:</strong> {selectedSubmission.start_date}</p>
            <p><strong>End Date:</strong> {selectedSubmission.end_date}</p>
            <p><strong>Description:</strong> {selectedSubmission.description || 'No description'}</p>
            <p><strong>Status:</strong> {selectedSubmission.status}</p>
            {selectedSubmission.remarks && (
              <p><strong>Remarks:</strong> {selectedSubmission.remarks}</p>
            )}
            <button className="ms-modal-close" onClick={() => setSelectedSubmission(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubmissionsPage;
