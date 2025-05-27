import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      login: () => console.warn('AuthProvider not found. Using fallback login.'),
      logout: () => console.warn('AuthProvider not found. Using fallback logout.'),
      register: () => console.warn('AuthProvider not found. Using fallback register.')
    };
  }
  
  return context;
}
