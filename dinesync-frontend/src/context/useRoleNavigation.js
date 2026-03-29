import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const useRoleNavigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (user?.role === 'ADMIN') navigate('/admin', { replace: true });
    else if (user?.role === 'MANAGER') navigate('/manager', { replace: true });
    else if (user?.role === 'WAITER') navigate('/waiter', { replace: true });
    else if (user?.role === 'KITCHEN_STAFF') navigate('/kitchen', { replace: true });
    else if (user?.role === 'CUSTOMER') navigate('/customer', { replace: true });
    else navigate('/login', { replace: true });
  };

  return { goToDashboard };
};