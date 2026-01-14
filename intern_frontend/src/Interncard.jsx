import './interncard.css';
import { Navigate, useNavigate } from 'react-router-dom';
import internImage from './assets/image2.png'; // Adjust path based on location

function Interncard() {
  const navigate = useNavigate();

  return (
    <div className="interncard" onClick={() => navigate('/internpage')}>
      <img
        src={internImage}
        alt="Intern Avatar"
        className="interncard-logo"
      />
      <div className="interncard-content">
        <h3>Intern</h3>
      </div>
    </div>
  );
}

export default Interncard;