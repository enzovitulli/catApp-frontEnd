import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../hooks/useAlert';
import { authApi } from '../services/api';
import { validatePassword } from '../utils/validation';

export default function ResetPasswordPage() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!uidb64 || !token) {
        setIsVerifying(false);
        setIsValidToken(false);
        showError('Enlace de recuperación inválido');
        return;
      }

      try {
        await authApi.verifyPasswordResetToken({ uidb64, token });
        setIsValidToken(true);
        console.log('Password reset token verified successfully');
      } catch (err) {
        console.error('Token verification error:', err);
        setIsValidToken(false);
        
        if (err.response?.data?.detail) {
          showError(err.response.data.detail);
        } else {
          showError('El enlace de recuperación ha expirado o es inválido');
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [uidb64, token, showError]);

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
      await authApi.confirmPasswordReset({
        uidb64,
        token,
        new_password: formData.new_password
      });
      
      console.log('Password reset successfully');
      showSuccess('¡Contraseña actualizada correctamente! Redirigiendo al login...');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Error resetting password:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.new_password) {
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
          showError('Error al restablecer la contraseña. Inténtalo de nuevo.');
        }
      } else {
        showError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center"
        >
          <div className="flex justify-center mb-4">
            <Loader2 size={48} className="text-orchid-600 animate-spin" />
          </div>
          <h2 className="text-2xl np-bold text-gray-800 mb-2">
            Verificando enlace
          </h2>
          <p className="text-gray-600 np-regular">
            Validando tu enlace de recuperación...
          </p>
        </motion.div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center"
        >
          <div className="flex justify-center mb-4">
            <XCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl np-bold text-gray-800 mb-2">
            Enlace inválido
          </h2>
          <p className="text-gray-600 np-regular mb-6">
            El enlace de recuperación ha expirado o es inválido. Solicita un nuevo enlace de recuperación.
          </p>
          <Button
            onClick={handleBackToLogin}
            variant="primary"
            className="w-full"
          >
            Volver al login
          </Button>
        </motion.div>
      </div>
    );
  }

  // Valid token - show password reset form
  const hasValidData = formData.new_password && formData.confirm_password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orchid-100 rounded-2xl">
              <Lock size={32} className="text-orchid-600" />
            </div>
          </div>
          <h2 className="text-2xl np-bold text-gray-800 mb-2">
            Nueva contraseña
          </h2>
          <p className="text-gray-600 np-regular">
            Introduce tu nueva contraseña para completar el proceso de recuperación
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
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
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
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

          {/* Submit Button */}
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!hasValidData || isLoading}
            leftIcon={isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            className="w-full py-4 text-lg np-bold"
            variant="primary"
            size="lg"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>

          {/* Back to login link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-gray-600 hover:text-orchid-600 transition-colors np-medium"
            >
              Volver al login
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 