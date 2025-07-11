import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { 
  Mail, Lock, ArrowRight, ArrowLeft, LogIn, Eye, EyeOff
} from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';
import ForgotPassword from '../components/ForgotPassword';
import { useAuth } from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';
import { validateEmail, validatePassword } from '../utils/validation';

export default function LoginPage() {    const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});
  // Track whether user has attempted to submit
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  // Track submission attempts to trigger icon wiggle animation
  const [submissionCounter, setSubmissionCounter] = useState(0);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, showSuccess } = useAlert();  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing (only if there's an existing error)
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  const validateForm = () => {
    const errors = {};
    
    // Mark that user has attempted submission
    setSubmissionAttempted(true);
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
    
    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
    
    // Update validation errors state
    setValidationErrors(errors);
    
    // Show general error if there are validation errors
    if (Object.keys(errors).length > 0) {
      // Increment submission counter to trigger icon wiggle animation
      setSubmissionCounter(prev => prev + 1);
      showError('Por favor, corrige los errores en el formulario');
      return false;
    }
    
    return true;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Use auth context login method
      const result = await login(formData);
        if (result.success) {
        showSuccess(result.message || '¡Bienvenido de vuelta!');
        
        // Get user info from localStorage to determine redirect
        const userInfo = localStorage.getItem('user');
        const user = userInfo ? JSON.parse(userInfo) : null;
        
        // Redirect based on user type
        if (user?.tipo === 'EMPRESA') {
          navigate('/backoffice');
        } else {
          navigate('/app');
        }
      } else {
        showError(result.error || 'Credenciales incorrectas. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Login error:', err);
      showError('Error de conexión. Inténtalo de nuevo más tarde.');
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

  const getMobileButtonText = () => {
    if (loading) {
      return 'Iniciando...';
    }
    return 'Iniciar sesión';
  };

  return (<div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex flex-col">
      {/* Header with back to home button - Responsive height */}
      <div className="flex justify-between items-center p-4 sm:p-4 lg:p-4 flex-shrink-0 
                      h-12 sm:h-14 lg:h-16 
                      max-h-[8vh] min-h-[48px]">
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="flex items-center text-white drop-shadow-sm hover:text-aquamarine-200 transition-colors p-2 space-x-2"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="np-medium text-sm sm:text-base">Volver al inicio</span>
        </Link>
        
        {/* Empty space for balance */}
        <div className="w-8"></div>
      </div>      {/* Main Content Container - Adaptive sizing */}
      <div className="flex-1 flex items-center justify-center 
                      px-3 py-2 sm:px-4 sm:py-3 lg:px-8 lg:py-4
                      min-h-0
                      lg:min-h-[calc(100vh-80px)]">
        <div className="w-full flex flex-col
                        max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl
                        h-full">          {/* Card Container - Ultra-responsive for small screens like iPhone SE, with extra space for error messages */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 
                       flex flex-col
                       p-2 xs:p-3 sm:p-4 lg:p-6
                       h-[clamp(540px,72vh,680px)] sm:h-[clamp(520px,65vh,680px)] lg:h-[clamp(620px,75vh,800px)]"
            style={{
              minHeight: '540px' // Extra height for error messages
            }}
          >            {/* Header - Ultra-compact on tiny screens for maximum content space */}
            <div className="text-center flex-shrink-0
                           h-[clamp(80px,16%,130px)] xs:h-[clamp(90px,18%,140px)] sm:h-[clamp(140px,25%,180px)] lg:h-[clamp(160px,22%,200px)]"
                 style={{
                   minHeight: '80px' // Reduced for ultra-small screens like iPhone SE
                 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-1 xs:mb-2 sm:mb-2 lg:mb-3 flex justify-center
                           h-8 xs:h-10 sm:h-12 lg:h-16
                           items-center"
              >
                {/* Reasonable responsive icon sizing */}
                <div className="scale-75 xs:scale-75 sm:scale-90 lg:scale-100">
                  <LogIn size={48} className="text-aquamarine-600" />
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl 
                           np-bold text-gray-800 mb-1 xs:mb-1 sm:mb-2
                           leading-tight"
              >
                ¡Bienvenido de vuelta!
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg xs:text-xl sm:text-lg lg:text-xl xl:text-2xl 
                           text-gray-600 np-regular
                           leading-tight"
              >
                Inicia sesión para continuar
              </motion.p>
            </div>            {/* Form Content - Ultra-flexible for small screens, prioritizes fitting inputs with error messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1 flex flex-col justify-center 
                         px-1 xs:px-2 sm:px-2 lg:px-4
                         py-1 xs:py-1.5 sm:py-2 lg:py-3
                         min-h-[clamp(260px,58%,360px)] xs:min-h-[clamp(280px,60%,380px)] sm:min-h-[clamp(220px,50%,320px)] lg:min-h-[clamp(280px,55%,400px)]"
            >
              <div className="space-y-1 xs:space-y-1.5 sm:space-y-3 lg:space-y-4">
                {/* Email */}
                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="tu@email.com"
                  leftIcon={<Mail size={18} className="sm:w-5 sm:h-5" />}
                  error={submissionAttempted && !!validationErrors.email}
                  errorMessage={submissionAttempted ? validationErrors.email : ''}
                  submissionTrigger={submissionCounter}
                />

                {/* Password */}                <InputField
                  id="password"
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  placeholder="Tu contraseña"
                  leftIcon={<Lock size={18} className="sm:w-5 sm:h-5" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="sm:w-5 sm:h-5" />
                      ) : (
                        <Eye size={18} className="sm:w-5 sm:h-5" />
                      )}
                    </button>
                  }
                  error={submissionAttempted && !!validationErrors.password}
                  errorMessage={submissionAttempted ? validationErrors.password : ''}
                  submissionTrigger={submissionCounter}
                  rightLabelElement={
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-orchid-600 hover:text-orchid-500 np-medium transition-colors cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  }
                  required
                />
              </div>
            </motion.div>            {/* Navigation Buttons - Reduced spacing on mobile for better fit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex-shrink-0 mt-1 sm:mt-2 lg:mt-4"
            >
              <div className="flex justify-center gap-3 sm:gap-4">
                {/* Login Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="py-3 xs:py-3 sm:py-3 text-sm xs:text-base sm:text-base 
                             np-bold min-h-[44px] xs:min-h-[44px] sm:min-h-[44px] lg:min-h-[48px]
                             px-6 xs:px-8 sm:px-8 lg:px-10
                             min-w-[120px] xs:min-w-[140px] sm:min-w-[140px] lg:min-w-[160px]"
                  variant="primary"
                  size="lg"
                  rightIcon={getButtonIcon()}                >
                  <span className="truncate">
                    <span className="hidden sm:inline">{getButtonText()}</span>
                    <span className="sm:hidden">{getMobileButtonText()}</span>
                  </span>
                </Button>
              </div>
            </motion.div>
          </motion.div>          {/* Register Link - Reduced height and spacing for mobile optimization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center flex-shrink-0"
            style={{
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '12px'
            }}
          >
            <div>
              <span className="text-white/80 np-regular text-sm sm:text-base">¿No tienes cuenta? </span>
              <Link to="/register" className="text-aquamarine-600 hover:text-aquamarine-500 
                                           np-bold transition-colors text-sm sm:text-base">
                Regístrate
              </Link>
            </div>          </motion.div>
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
