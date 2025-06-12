import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import PropTypes from 'prop-types';

/**
 * Protected route wrapper component specifically for EMPRESA users
 * Redirects non-company users to the main app
 */
const ProtectedCompanyRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to main app if not a company user
  if (user?.tipo !== 'EMPRESA') {
    return <Navigate to="/app" replace />;
  }
  
  // Render child routes if authenticated and is a company
  return <Outlet />;
};

export default ProtectedCompanyRoute;
