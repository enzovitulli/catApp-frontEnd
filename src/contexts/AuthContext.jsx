import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { authApi } from '../services/api';
import { AuthContext } from './authContext.js';

// Auth provider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Check for token in localStorage on mount
  useEffect(() => {
    const checkAuth = () => {
      console.log('🔍 Checking authentication on app startup...');
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      
      console.log('🔑 Token found:', !!token);
      console.log('👤 User info found:', !!userInfo);
      
      if (token) {
        console.log('✅ Token exists, setting authenticated state');
        // Here you would normally validate the token with your backend
        setIsAuthenticated(true);
        
        // Fetch user info if you have it stored or from API
        const parsedUser = JSON.parse(userInfo || 'null');
        setUser(parsedUser);
        console.log('👤 User loaded:', parsedUser);
      } else {
        console.log('❌ No token found, user not authenticated');
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);  // Login function
  const login = async (credentials) => {
    try {
      console.log('🔐 Login attempt with:', credentials);
      
      // Make actual API call to login endpoint
      const response = await authApi.login(credentials);
      
      console.log('📡 Login API response:', response.data);
      
      const { token, user, message } = response.data;
      
      console.log('🔑 Token received:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('👤 User data:', user);
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Verify storage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log('💾 Token stored successfully:', !!storedToken);
      console.log('💾 User stored successfully:', !!storedUser);
      
      // Update state
      setIsAuthenticated(true);
      setUser(user);
      
      console.log('✅ Login successful:', message);
      return { success: true, message };
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to login';
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };  // Register function
  const register = async (userData) => {
    try {
      console.log('Register with:', userData);
      
      // Make actual API call to register endpoint
      const response = await authApi.register(userData);
      
      const { token, user, message } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setIsAuthenticated(true);
      setUser(user);
      
      console.log('Registration successful:', message);
      return { success: true, message };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to register';
      return { success: false, error: errorMessage };    }
  };

  // Update user function
  const updateUser = (updatedUserData) => {
    console.log('Updating user data:', updatedUserData);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    
    // Update state
    setUser(updatedUserData);
    
    console.log('User data updated successfully');
  };

  // Context value
  const value = useMemo(() => ({
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    updateUser
  }), [isAuthenticated, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Default export for better compatibility
export default AuthProvider;