import React, { useState, useEffect } from 'react';
import './Admin.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminOverviewPage = () => {
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await axios.get('http://localhost:3000/submissions/admin/overview');

        const rawOverview = response.data.overview;

        // Transform object structure to array structure
        const transformedOverview = Object.entries(rawOverview).map(([departmentName, classes]) => ({
          departmentName,
          classes: Object.entries(classes).map(([className, submissions]) => ({
            className,
            submissions,
          })),
        }));

        setOverview(transformedOverview);
      } catch (err) {
        console.error('Failed to fetch overview:', err.message);
        setError('Failed to load admin overview.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const getFilteredDepartments = () => {
    return overview.map((dept) => dept.departmentName);
  };

  const getFilteredClasses = () => {
    const dept = overview.find((d) => d.departmentName === selectedDept);
    return dept ? dept.classes.map((cls) => cls.className) : [];
  };

  const getFilteredData = () => {
    if (!selectedDept) return [];
    const dept = overview.find((d) => d.departmentName === selectedDept);
    if (!dept) return [];

    if (selectedClass) {
      const cls = dept.classes.find((c) => c.className === selectedClass);
      return cls ? [cls] : [];
    }

    return dept.classes;
  };

  if (loading) return <p className="admin-loading">Loading...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <Link to="/" className="admin-home-button">Home</Link>
      </header>

      <main className="admin-main-content">
        <div className="admin-filters">
          <label>
            Department:
            <select value={selectedDept} onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedClass(''); // reset class filter on dept change
            }}>
              <option value="">-- Select Department --</option>
              {getFilteredDepartments().map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </label>

          {selectedDept && (
            <label>
              Class:
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">-- All Classes --</option>
                {getFilteredClasses().map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {selectedDept ? (
          getFilteredData().length === 0 ? (
            <p>No submissions found for selected filters.</p>
          ) : (
            getFilteredData().map((cls) => (
              <div key={cls.className} className="admin-class-block">
                <h3>
                  Class: {cls.className} — <span>{cls.submissions.length} accepted submissions</span>
                </h3>
                {cls.submissions.length > 0 && (
                  <details>
                    <summary>View Submissions</summary>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Company</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cls.submissions.map((sub, index) => (
                          <tr key={index}>
                            <td>{sub.studentName}</td>
                            <td>{sub.companyName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                )}
              </div>
            ))
          )
        ) : (
          <p>Please select a department to begin.</p>
        )}
      </main>

      <footer className="admin-footer">© 2025 PSG TECH</footer>
    </div>
  );
};

export default AdminOverviewPage;
