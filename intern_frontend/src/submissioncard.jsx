import './submissioncard.css';
import { Navigate, useNavigate } from 'react-router-dom';
import submissionImage from './assets/image3.png'; // Adjust path based on location

function Submissioncard() {
  const navigate = useNavigate();

  return (
    <div className="submissioncard" onClick={() => navigate('/my-submissions')}>
      <img
        src={submissionImage}
        alt="Submission Image"
        className="submissioncard-logo"
      />
      <div className="submissioncard-content">
        <h3>Submissions</h3>
      </div>
    </div>
  );
}

export default Submissioncard;