import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleRedirectHandler = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'student') {
          navigate('/studentpage');
        } else if (user.role === 'staff') {
          navigate('/staffpage');
        } else {
          navigate('/dashboard'); // fallback
        }
      } catch (err) {
        console.error('Failed to parse user:', err);
        setError('Invalid user data');
      }
    } else {
      setError('Missing token or user info');
    }
  }, [navigate]);

  return <div>{error ? <p>{error}</p> : <p>Logging you in...</p>}</div>;
};

export default GoogleRedirectHandler;
