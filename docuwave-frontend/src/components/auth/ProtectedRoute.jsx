import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from '../../router/RouterProvider';

function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRoles = React.useMemo(() => {
    if (!user || !Array.isArray(user.roles)) {
      return [];
    }

    return user.roles;
  }, [user]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      if (location.pathname !== '/login') {
        navigate('/login', {
          replace: true,
          state: { from: location.pathname }
        });
      }
      return;
    }

    if (requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        if (location.pathname !== '/login') {
          navigate('/login', {
            replace: true,
            state: { from: location.pathname, unauthorized: true }
          });
        }
      }
    }
  }, [isAuthenticated, requiredRoles, userRoles, navigate, location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return null;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
