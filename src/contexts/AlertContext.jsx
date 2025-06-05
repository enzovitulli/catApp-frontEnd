import { useState, useCallback, useMemo } from 'react';
import { AlertContext } from './alertContext';
import Alert from '../components/Alert';
import PropTypes from 'prop-types';

// Alert provider component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Generate unique ID for alerts
  const generateId = () => `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  // Remove alert function
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Show alert function
  const showAlert = useCallback((type, message, duration = 4000) => {
    const id = generateId();
    const newAlert = {
      id,
      type,
      message,
      duration,
      isVisible: true
    };

    setAlerts(prev => [...prev, newAlert]);

    // Auto-remove alert after duration + animation time
    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration + 500);
    }

    return id;
  }, [removeAlert]);

  // Convenience methods for different alert types
  const showSuccess = useCallback((message, duration) => showAlert('success', message, duration), [showAlert]);
  const showWarning = useCallback((message, duration) => showAlert('warning', message, duration), [showAlert]);
  const showError = useCallback((message, duration) => showAlert('error', message, duration), [showAlert]);
  const showInfo = useCallback((message, duration) => showAlert('info', message, duration), [showAlert]);
  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const value = useMemo(() => ({
    alerts,
    showAlert,
    showSuccess,
    showWarning,
    showError,
    showInfo,
    removeAlert,
    clearAllAlerts
  }), [alerts, showAlert, showSuccess, showWarning, showError, showInfo, removeAlert, clearAllAlerts]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      
      {/* Render alerts */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 80}px)`,
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            <Alert
              type={alert.type}
              message={alert.message}
              isVisible={alert.isVisible}
              duration={alert.duration}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AlertProvider;
