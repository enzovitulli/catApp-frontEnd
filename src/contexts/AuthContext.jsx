import { useState, useEffect, createContext } from 'react';

// Create context
export const AuthContext = createContext(null);

// Auth provider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for token in localStorage on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Here you would normally validate the token with your backend
        setIsAuthenticated(true);
        
        // Fetch user info if you have it stored or from API
        const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(userInfo);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      // This will be replaced with actual API call
      console.log('Login with:', credentials);
      
      // Mock successful login
      const mockResponse = {
        token: 'mock-token-12345',
        user: { id: 1, name: 'Test User', email: credentials.email }
      };
      
      // Store token and user info
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      
      // Update state
      setIsAuthenticated(true);
      setUser(mockResponse.user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Failed to login' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Register function
  const register = async (userData) => {
    try {
      // This will be replaced with actual API call
      console.log('Register with:', userData);
      
      // Mock successful registration
      const mockResponse = {
        token: 'mock-token-12345',
        user: { 
          id: 1, 
          name: userData.name, 
          email: userData.email 
        }
      };
      
      // Store token and user info
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      
      // Update state
      setIsAuthenticated(true);
      setUser(mockResponse.user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Failed to register' };
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}