import React, { useState, useEffect } from 'react';
import './StaffPage.css';
import logo from './assets/logo1.webp';
import { Link } from 'react-router-dom';
import axios from 'axios';

function StaffPage() {
  const [acceptedSubmissions, setAcceptedSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAcceptedSubmissions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view submissions.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:3000/submissions/accepted-submissions/class',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Fetched accepted submissions:', response.data);
        setAcceptedSubmissions(response.data.submissions || []);
      } catch (err) {
        console.error('Fetch Error:', err.response?.data || err.message);
        setError('Failed to load accepted submissions: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedSubmissions();
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <div className="img-container">
          <img src={logo} alt="logo" />
          <h1>PSG TECH</h1>
        </div>
      </header>

      <main className="sp-main-content">
        <div className="sp-cards-container">
          {/* Profile Card */}
          <Link to="/profilepage" className="sp-card">
            <h2 className="sp-card-title">Profile</h2>
          </Link>

          {/* Review Card */}
          <Link to="/review" className="sp-card">
            <h2 className="sp-card-title">Review</h2>
          </Link>

          {/* Accepted Submissions Card */}
            <Link to="/accepted-submissions" className="sp-card">
            <h2 className="sp-card-title">Accepted Submissions</h2>
            </Link>

        </div>
      </main>

      <footer className="footer">Footer</footer>
    </div>
  );
}

export default StaffPage;
