import React, { useState, useEffect } from 'react';
import './Profilepage.css'; // Unique CSS file
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    rollNumber: '',
    year: '',
    department: '',
  });
  const [editedProfile, setEditedProfile] = useState({
    rollNumber: '',
    year: '',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/submissions/me/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched profile:', response.data);
        const { student } = response.data;
        setProfile({
          email: student.email,
          name: student.name,
          rollNumber: student.rollNumber || '',
          year: student.year || '',
          department: student.department || 'Not Selected',
        });
        setEditedProfile({
          rollNumber: student.rollNumber || '',
          year: student.year || '',
          departmentId: '', // Will be updated via form
        });
      } catch (err) {
        console.error('Fetch Error:', err.response?.data || err.message);
        setError('Failed to load profile: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/submissions/departments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(response.data.departments);
        console.log('Departments response:', response.data);
      } catch (err) {
        console.error('Failed to load departments:', err.message);
      }
    };

    fetchProfile();
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to update your profile.');
      return;
    }

    const updateData = {};
    if (editedProfile.rollNumber !== profile.rollNumber) updateData.rollNumber = editedProfile.rollNumber;
    if (editedProfile.year !== profile.year) updateData.year = editedProfile.year;
    if (editedProfile.departmentId && editedProfile.departmentId !== profile.department) {
      updateData.departmentId = editedProfile.departmentId;
    }

    if (Object.keys(updateData).length === 0) {
      setError('No changes to update.');
      return;
    }

    try {
      const response = await axios.patch('http://localhost:3000/submissions/me/update-profile', updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Update Response:', response.data);
      setSuccess('Profile updated successfully!');
      setProfile((prev) => ({
        ...prev,
        rollNumber: response.data.student.rollNumber,
        year: response.data.student.year,
        department: response.data.student.department,
      }));
      // Refresh profile to reflect class creation if department is set
      const profileResponse = await axios.get('http://localhost:3000/submissions/me/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({
        email: profileResponse.data.student.email,
        name: profileResponse.data.student.name,
        rollNumber: profileResponse.data.student.rollNumber,
        year: profileResponse.data.student.year,
        department: profileResponse.data.student.department,
      });
    } catch (err) {
      console.error('Update Error:', err.response?.data || err.message);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="pp-app-container">
      <header className="pp-header">
        <div className="pp-img-container">
          <img src="/assets/logo1.webp" alt="logo" />
          <h1>PSG TECH</h1>
        </div>
        <Link to="/studentpage" className="pp-home-button">Home</Link>
      </header>
      <main className="pp-main-content">
        <div className="pp-profile-container">
          <h2 className="pp-profile-title">My Profile</h2>
          {loading ? (
            <p className="pp-loading">Loading...</p>
          ) : error ? (
            <p className="pp-error">{error}</p>
          ) : (
            <>
              <div className="pp-profile-details">
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Roll Number:</strong> {profile.rollNumber}</p>
                <p><strong>Year:</strong> {profile.year}</p>
                <p><strong>Department:</strong> {profile.department}</p>
              </div>
              <form className="pp-edit-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="rollNumber"
                  placeholder="Roll Number"
                  value={editedProfile.rollNumber}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  value={editedProfile.year}
                  onChange={handleChange}
                />
                <select
                  name="departmentId"
                  value={editedProfile.departmentId}
                  onChange={handleChange}
                  disabled={profile.department !== 'Not Selected'} // Disable if already set
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="pp-submit-button">Update Profile</button>
                {success && <p className="pp-success">{success}</p>}
                {error && <p className="pp-error">{error}</p>}
              </form>
            </>
          )}
        </div>
      </main>
      <footer className="pp-footer">Footer</footer>
    </div>
  );
};

export default ProfilePage;