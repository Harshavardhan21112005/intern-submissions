import './studentpage.css';
import Profilecard from './Profilecard';
import logo from './assets/logo1.webp';
import Interncard from './Interncard';
import Submissioncard from './submissioncard';
import { useNavigate } from 'react-router-dom';

function Studentpage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="img-container">
          <img src={logo} alt="logo" />
          <h1>PSG TECH</h1>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="smain-content">
        <Profilecard />
        <Interncard />
        <Submissioncard />
      </main>

      <footer className="footer">Footer</footer>
    </div>
  );
}

export default Studentpage;