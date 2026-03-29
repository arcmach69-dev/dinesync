import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const useBlockBackNav = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      const confirmed = window.confirm(
        'Are you sure you want to logout and exit?'
      );
      if (confirmed) {
        logout();
        navigate('/login', { replace: true });
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
};