import React, { useState, useEffect } from 'react';
import './Login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import background from './assets/loginbackground.png';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegisterClick = () => setIsRightPanelActive(true);
  const handleLoginClick = () => setIsRightPanelActive(false);

  // Handle redirect callback from backend
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    console.log('URL Params:', { token, userStr }); // Debug log
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        console.log('Parsed User:', user); // Debug log
        if (!user.role) {
          console.warn('Role not found in user object:', user);
          setError('Role not determined');
          return;
        }
        localStorage.setItem('token', token);
        navigate(user.role === 'student' ? '/studentpage' : '/staffpage');
      } catch (error) {
        console.error('Parsing Error:', error, { userStr }); // Debug error
        setError('Failed to parse user data: ' + error.message);
      }
    } else {
      console.log('No token or user in URL params');
    }
  }, [navigate]);

  return (
    <div
      className="login-wrapper"
      style={{
        backgroundImage: `url(${background})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'calc(-25vw) bottom',
        backgroundSize: 'cover',
      }}
    >
      <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
        <div className="form-container sign-up">
          <form>
            <h1>Create Account</h1>
            <div className="social-icons">
              <a
                href="http://localhost:3000/auth/google"
                className="icon"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <i className="fab fa-google-plus-g" style={{ fontSize: '24px' }}></i> Sign up with Google
              </a>
            </div>
            <span>or use your email for registration</span>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Sign Up</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="form-container sign-in">
          <form>
            <h1>Sign In</h1>
            <div className="social-icons">
              <a
                href="http://localhost:3000/auth/google"
                className="icon"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <i className="fab fa-google-plus-g" style={{ fontSize: '24px' }}></i> Sign in with Google
              </a>
            </div>
            <span>or use your email password</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Forget Your Password?</a>
            <button>Sign In</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" onClick={handleLoginClick}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className="hidden" onClick={handleRegisterClick}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default () => (
  <GoogleOAuthProvider clientId="1084022078678-iu6qvu34p84bug2ed2gepeu46094m13j.apps.googleusercontent.com">
    <Login />
  </GoogleOAuthProvider>
);