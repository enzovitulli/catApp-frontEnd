import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, X, Save, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import InputField from './InputField';
import Button from './Button';
import { useAlert } from '../hooks/useAlert';
import { authApi } from '../services/api';
import { validatePassword } from '../utils/validation';

const ChangePassword = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { showError, showSuccess } = useAlert();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate current password
    if (!formData.current_password) {
      errors.current_password = 'La contraseña actual es requerida';
      isValid = false;
    }

    // Validate new password
    const newPasswordValidation = validatePassword(formData.new_password);
    if (!newPasswordValidation.isValid) {
      errors.new_password = newPasswordValidation.message;
      isValid = false;
    }

    // Validate password confirmation
    if (!formData.confirm_password) {
      errors.confirm_password = 'Confirma tu nueva contraseña';
      isValid = false;
    } else if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden';
      isValid = false;
    }

    // Check if new password is different from current
    if (formData.current_password && formData.new_password && 
        formData.current_password === formData.new_password) {
      errors.new_password = 'La nueva contraseña debe ser diferente a la actual';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      
      console.log('Password changed successfully');
      showSuccess('Contraseña actualizada correctamente');
      
      // Reset form and close modal
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setValidationErrors({});
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error('Error changing password:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle specific error cases
        if (errorData.current_password) {
          setValidationErrors(prev => ({
            ...prev,
            current_password: Array.isArray(errorData.current_password) 
              ? errorData.current_password[0] 
              : errorData.current_password
          }));
        } else if (errorData.new_password) {
          setValidationErrors(prev => ({
            ...prev,
            new_password: Array.isArray(errorData.new_password) 
              ? errorData.new_password[0] 
              : errorData.new_password
          }));
        } else if (errorData.detail) {
          showError(errorData.detail);
        } else if (errorData.non_field_errors) {
          showError(Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors);
        } else {
          showError('Error al cambiar la contraseña. Inténtalo de nuevo.');
        }
      } else {
        showError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    const hasData = formData.current_password || formData.new_password || formData.confirm_password;
    
    if (hasData) {
      if (window.confirm('¿Estás seguro de que quieres cerrar? Se perderán los cambios no guardados.')) {
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setValidationErrors({});
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasValidData = formData.current_password && formData.new_password && formData.confirm_password;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-marine-800 rounded-3xl w-full max-w-md max-h-[calc(90vh-6rem)] md:max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-marine-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orchid-100 dark:bg-orchid-900/50 rounded-2xl">
                <Lock size={24} className="text-orchid-600 dark:text-orchid-400" />
              </div>
              <div>
                <h2 className="text-2xl np-bold text-gray-900 dark:text-white">
                  Cambiar Contraseña
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actualiza tu contraseña de acceso
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-marine-700 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Form Content */}
                      <div className="overflow-y-auto max-h-[calc(90vh-6rem-140px)] md:max-h-[calc(90vh-140px)] custom-scrollbar">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Current Password */}
              <div>
                <InputField
                  id="current_password"
                  label="Contraseña actual"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.current_password}
                  onChange={(value) => handleInputChange('current_password', value)}
                  placeholder="Introduce tu contraseña actual"
                  leftIcon={<Lock size={20} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-marine-700 rounded transition-colors"
                    >
                      {showPasswords.current ? (
                        <EyeOff size={16} className="text-gray-500" />
                      ) : (
                        <Eye size={16} className="text-gray-500" />
                      )}
                    </button>
                  }
                  error={validationErrors.current_password}
                />
              </div>

              {/* New Password */}
              <div>
                <InputField
                  id="new_password"
                  label="Nueva contraseña"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(value) => handleInputChange('new_password', value)}
                  placeholder="Introduce tu nueva contraseña"
                  leftIcon={<Lock size={20} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-marine-700 rounded transition-colors"
                    >
                      {showPasswords.new ? (
                        <EyeOff size={16} className="text-gray-500" />
                      ) : (
                        <Eye size={16} className="text-gray-500" />
                      )}
                    </button>
                  }
                  error={validationErrors.new_password}
                  helperText="Mínimo 8 caracteres, sin espacios"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <InputField
                  id="confirm_password"
                  label="Confirmar nueva contraseña"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(value) => handleInputChange('confirm_password', value)}
                  placeholder="Confirma tu nueva contraseña"
                  leftIcon={<Lock size={20} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-marine-700 rounded transition-colors"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={16} className="text-gray-500" />
                      ) : (
                        <Eye size={16} className="text-gray-500" />
                      )}
                    </button>
                  }
                  error={validationErrors.confirm_password}
                />
              </div>

              {/* Form Footer - Inside the scrollable area */}
              <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200 dark:border-marine-600">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {hasValidData ? 'Listo para actualizar' : 'Completa todos los campos'}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!hasValidData || isLoading}
                    leftIcon={isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  >
                    {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

ChangePassword.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ChangePassword; 