import { useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, ArrowRight, X, KeyRound, Check
} from 'lucide-react';
import Button from './Button';

export default function ForgotPassword({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Por favor, introduce tu email');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Por favor, introduce un email válido');
      return;
    }

    setLoading(true);
    setError('');    try {
      // Backend endpoint for password reset (when implemented):
      // import apiClient from '../services/api'; 
      // const response = await apiClient.post('/auth/forgot-password/', { email });
      // if (response.status === 200) { setSuccess(true); }
      
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Simulate success for now
      setSuccess(true);
      
    } catch (err) {
      console.error('Forgot password error:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.email) {
          setError(errorData.email[0] || 'Error en el email');
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('No se pudo procesar la solicitud. Inténtalo de nuevo.');
        }
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  const getButtonIcon = () => {
    if (loading) {
      return <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full" />;
    }
    if (success) {
      return <Check size={20} />;
    }
    return <ArrowRight size={20} />;
  };

  const getButtonText = () => {
    if (loading) {
      return 'Enviando...';
    }
    if (success) {
      return 'Email enviado';
    }
    return 'Enviar instrucciones';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orchid-100 rounded-2xl">
                    <KeyRound size={24} className="text-orchid-600" />
                  </div>
                  <h2 className="text-2xl np-bold text-gray-800">
                    Recuperar contraseña
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {!success ? (
                <>
                  {/* Description */}
                  <p className="text-gray-600 np-regular mb-6">
                    Introduce tu email y te enviaremos instrucciones para recuperar tu contraseña.
                  </p>

                  {/* Email Input */}
                  <div className="mb-6">
                    <label htmlFor="forgot-email" className="block text-sm np-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        placeholder="tu@email.com"
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:border-orchid-500 focus:outline-none transition-colors np-regular"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 mb-6 np-medium"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 text-lg np-bold"
                    variant="primary"
                    size="lg"
                    rightIcon={getButtonIcon()}
                  >
                    {getButtonText()}
                  </Button>
                </>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-aquamarine-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-aquamarine-600" />
                    </div>
                    <h3 className="text-xl np-bold text-gray-800 mb-2">
                      ¡Email enviado!
                    </h3>
                    <p className="text-gray-600 np-regular">
                      Hemos enviado las instrucciones para recuperar tu contraseña a{' '}
                      <span className="np-medium text-gray-800">{email}</span>
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-blue-700 np-medium">
                      Revisa tu bandeja de entrada y sigue las instrucciones del email. 
                      Si no lo encuentras, revisa tu carpeta de spam.
                    </p>
                  </div>

                  <Button
                    onClick={handleClose}
                    className="w-full py-4 text-lg np-bold"
                    variant="secondary"
                    size="lg"
                  >
                    Entendido
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>      )}
    </AnimatePresence>
  );
}

ForgotPassword.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
