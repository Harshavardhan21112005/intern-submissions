import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AcceptedSubmissionsPage.css'; // custom styles
import logo from './assets/logo1.webp';
import { Link } from 'react-router-dom';

function AcceptedSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized. Please login.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:3000/submissions/accepted-submissions/class', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(res.data.submissions || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load accepted submissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <div className="img-container">
          <img src={logo} alt="logo" />
          <h1>PSG TECH</h1>
        </div>
        <nav className="nav-links">
          <Link to="/staffpage">Dashboard</Link>
          <Link to="/profilepage">Profile</Link>
          <Link to="/review">Review</Link>
        </nav>
      </header>

      <main className="accepted-main">
        <h2 className="accepted-title">Accepted Submissions by Class</h2>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : submissions.length === 0 ? (
          <p className="empty">No accepted submissions available.</p>
        ) : (
          <div className="submissions-grid">
            {submissions.map((sub, index) => (
              <div className="submission-card" key={sub.id}>
                <h3>{sub.company_name}</h3>
                <p><strong>Role:</strong> {sub.role}</p>
                <p><strong>student:</strong> {sub.studentName}</p>
                <p><strong>Class:</strong> {sub.student_email?.slice(0, 4) || 'Unknown'}</p>
                <p><strong>#</strong> {index + 1}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© PSG Tech | Training Portal</p>
      </footer>
    </div>
  );
}

export default AcceptedSubmissionsPage;
