import React, { useState } from 'react';
import './internpage.css';
import logo from './assets/logo1.webp';
import axios from 'axios';

const Internpage = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    role: '',
    supervisor_name: '',
    supervisor_email: '',
    department_guide: '',
    tutor_email: '', // Tutor email added
    stipend: '',
    start_date: '',
    end_date: '',
    description: '',
    pending_redo_courses: '',
    pending_ra_courses: '',
    pending_current_courses: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to submit internship details.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/submissions', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Internship details submitted successfully!');
      setFormData({
        company_name: '',
        company_address: '',
        role: '',
        supervisor_name: '',
        supervisor_email: '',
        department_guide: '',
        tutor_email: '',
        stipend: '',
        start_date: '',
        end_date: '',
        description: '',
        pending_redo_courses: '',
        pending_ra_courses: '',
        pending_current_courses: '',
      });
    } catch (err) {
      setError(
        'Failed to submit internship details: ' +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="intern-app-container">
      <header className="intern-header">
        <div className="intern-img-container">
          <img src={logo} alt="PSG Tech Logo" />
          <h1>PSG TECH</h1>
        </div>
      </header>

      <main className="intern-main-content">
        <div className="intern-form-container">
          <h2>Internship Undertaking Form</h2>

          <form onSubmit={handleSubmit}>
            {/* Company Details */}
            <section className="intern-section">
              <h3>Company Details</h3>
              <div className="intern-grid">
                <input
                  type="text"
                  name="company_name"
                  placeholder="Company Name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="company_address"
                  placeholder="Company Address"
                  value={formData.company_address}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="role"
                  placeholder="Role / Position"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="stipend"
                  placeholder="Stipend (₹)"
                  value={formData.stipend}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Supervisor & Tutor */}
            <section className="intern-section">
              <h3>Supervisor & Tutor</h3>
              <div className="intern-grid">
                <input
                  type="text"
                  name="supervisor_name"
                  placeholder="Supervisor Name"
                  value={formData.supervisor_name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="supervisor_email"
                  placeholder="Supervisor Email"
                  value={formData.supervisor_email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="department_guide"
                  placeholder="Department Guide"
                  value={formData.department_guide}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="tutor_email"
                  placeholder="Tutor Email"
                  value={formData.tutor_email}
                  onChange={handleChange}
                  required
                />
              </div>
            </section>

            {/* Duration */}
            <section className="intern-section">
              <h3>Internship Duration</h3>
              <div className="intern-grid">
                <div className="intern-date-input">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="intern-date-input">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="intern-section">
              <h3>Internship Description</h3>
              <textarea
                name="description"
                placeholder="Internship Description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </section>

            {/* Academic Details */}
            <section className="intern-section">
              <h3>Academic Details</h3>
              <div className="intern-grid">
                <textarea
                  name="pending_redo_courses"
                  placeholder="Pending Redo Courses"
                  value={formData.pending_redo_courses}
                  onChange={handleChange}
                  rows={2}
                />
                <textarea
                  name="pending_ra_courses"
                  placeholder="Pending RA Courses"
                  value={formData.pending_ra_courses}
                  onChange={handleChange}
                  rows={2}
                />
                <textarea
                  name="pending_current_courses"
                  placeholder="Pending Current Courses"
                  value={formData.pending_current_courses}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </section>

            {/* Actions */}
            <div className="intern-form-actions">
              <button type="submit">Submit</button>
              {error && <p className="intern-error">{error}</p>}
              {success && <p className="intern-success">{success}</p>}
            </div>
          </form>
        </div>
      </main>

      <footer className="intern-footer">© 2025 PSG TECH</footer>
    </div>
  );
};

export default Internpage;
