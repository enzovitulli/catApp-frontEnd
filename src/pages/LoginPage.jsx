import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, ArrowRight, X, LogIn
} from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';
import ForgotPassword from '../components/ForgotPassword';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/api';

export default function LoginPage() {  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos requeridos');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Por favor, introduce un email válido');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      // Make direct API call to login endpoint
      const response = await apiClient.post('/auth/login/', formData);
      
      if (response.data?.token) {
        // Store token and navigate to app
        localStorage.setItem('token', response.data.token);
        
        // Update auth context
        await login(formData);
        
        navigate('/app');
      } else {
        setError('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error responses from backend
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for specific field errors
        if (errorData.email) {
          setError(errorData.email[0] || 'Error en el campo de email');
        } else if (errorData.password) {
          setError(errorData.password[0] || 'Error en la contraseña');
        } else if (errorData.detail) {
          setError(errorData.detail || 'Credenciales incorrectas');
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0] || 'Credenciales incorrectas');
        } else {
          setError('Credenciales incorrectas. Inténtalo de nuevo.');
        }
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getButtonIcon = () => {
    if (loading) {
      return <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full" />;
    }
    return <ArrowRight size={20} />;
  };

  const getButtonText = () => {
    if (loading) {
      return 'Iniciando sesión...';
    }
    return 'Iniciar sesión';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex flex-col">
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 lg:px-8">
        {/* Close Button */}
        <Link 
          to="/" 
          className="flex items-center text-green-400 hover:text-green-300 transition-colors p-2"
        >
          <X size={20} />
        </Link>
        
        {/* Title */}
        <div className="text-white font-medium">
          Iniciar sesión
        </div>
        
        {/* Empty space for balance */}
        <div className="w-8"></div>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 min-h-[500px] flex flex-col"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <LogIn size={48} className="text-aquamarine-400 mx-auto" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl np-bold text-gray-800 mb-3"
              >
                ¡Bienvenido de vuelta!
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 np-light"
              >
                Inicia sesión para continuar
              </motion.p>
            </div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1 flex flex-col justify-center"
            >              <div className="space-y-6">
                {/* Email */}
                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="tu@email.com"
                  leftIcon={<Mail size={20} />}
                  labelSize="sm"
                  iconColor="text-gray-500"
                  focusColor="focus:border-green-500"
                  placeholderColor="placeholder-gray-500"
                />

                {/* Password */}
                <InputField
                  id="password"
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  placeholder="Tu contraseña"
                  leftIcon={<Lock size={20} />}
                  labelSize="sm"
                  iconColor="text-gray-500"
                  focusColor="focus:border-green-500"
                  placeholderColor="placeholder-gray-500"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-orchid-600 hover:text-orchid-500 np-medium transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  }
                />
              </div>
            </motion.div>

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

            {/* Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
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
            </motion.div>
          </motion.div>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6"
          >
            <span className="text-white/80 np-regular">¿No tienes cuenta? </span>
            <Link to="/register" className="text-green-400 hover:text-green-300 np-medium transition-colors underline">
              Regístrate
            </Link>          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPassword 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
}
