import './Profilecard.css';
import { Navigate, useNavigate } from 'react-router-dom';
import profileImage from './assets/image1.png'; // Adjust path based on location

function Profilecard() {
  const navigate = useNavigate();

  return (
    <div className="profilecard" onClick={() => navigate('/profilepage')}>
      <img
        src={profileImage}
        alt="Profile Avatar"
        className="profilecard-logo"
      />
      <div className="profilecard-content">
        <h3>Profile</h3>
      </div>
    </div>
  );
}

export default Profilecard;