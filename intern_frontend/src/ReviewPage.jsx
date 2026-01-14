import React, { useState, useEffect } from 'react';
import './ReviewPage.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ReviewPage = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access reviews.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/submissions/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingSubmissions(response.data.submissions || []);
      } catch (err) {
        console.error('Fetch Error:', err.response?.data || err.message);
        setError('Failed to load pending submissions: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `http://localhost:3000/submissions/${selectedSubmission.id}/decision`,
        {
          status: e.target.status.value,
          remarks: remarks || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingSubmissions((prev) =>
        prev.filter((sub) => sub.id !== selectedSubmission.id)
      );
      setSelectedSubmission(null);
      setRemarks('');
      setError('');
    } catch (err) {
      console.error('Review Error:', err.response?.data || err.message);
      setError('Failed to review submission: ' + (err.response?.data?.message || err.message));
    }
  };

const handleViewPdf = async (submissionId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(
      `http://localhost:3000/submissions/${submissionId}/download-pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // important to get binary data
      }
    );

    // Create a blob URL and open it in a new tab
    const file = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  } catch (err) {
    console.error('PDF Fetch Error:', err.response?.data || err.message);
    setError('Failed to load PDF: ' + (err.response?.data?.message || err.message));
  }
};


  return (
    <div className="rp-app-container">
      <header className="rp-header">
        <div className="rp-img-container">
          <img src="/assets/logo1.webp" alt="logo" />
          <h1>PSG TECH</h1>
        </div>
        <Link to="/staffpage" className="rp-back-button">Back to Staff Page</Link>
      </header>

      <main className="rp-main-content">
        <div className="rp-profile-container">
          <h2 className="rp-profile-title">Review Submissions</h2>
          {loading ? (
            <p className="rp-loading">Loading...</p>
          ) : error ? (
            <p className="rp-error">{error}</p>
          ) : (
            <>
              {pendingSubmissions.length === 0 ? (
                <p className="rp-no-data">No pending submissions.</p>
              ) : (
                <div className="rp-profile-details">
                  <ul className="rp-submissions-list">
                    {pendingSubmissions.map((submission) => (
                      <li
                        key={submission.id}
                        className="rp-submission-item"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        {submission.company_name} - {submission.role} ({submission.start_date} to {submission.end_date})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSubmission && (
                <form className="rp-edit-form" onSubmit={handleReview}>
                  <h3 className="rp-modal-title">Review Submission</h3>
                  <p><strong>Company:</strong> {selectedSubmission.company_name}</p>
                  <p><strong>Role:</strong> {selectedSubmission.role}</p>
                  <p><strong>Dates:</strong> {selectedSubmission.start_date} to {selectedSubmission.end_date}</p>

                  {/* View PDF Button */}
                  <button
                    type="button"
                    className="rp-pdf-button"
                    onClick={() => handleViewPdf(selectedSubmission.id)}
                  >
                    View PDF
                  </button>

                  <textarea
                    className="rp-remarks-input"
                    name="remarks"
                    placeholder="Add remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <select name="status" className="rp-status-select" defaultValue="">
                    <option value="" disabled>Select Action</option>
                    <option value="accepted">Accept</option>
                    <option value="declined">Decline</option>
                  </select>
                  <button type="submit" className="rp-submit-button">Submit Review</button>
                  {error && <p className="rp-error">{error}</p>}
                </form>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="rp-footer">© 2025 PSG TECH</footer>
    </div>
  );
};

export default ReviewPage;
