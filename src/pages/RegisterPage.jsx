import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { useAlert } from '../hooks/useAlert';
import { validateEmail, validateSpanishPhone, validatePassword, validateName } from '../utils/validation';
import apiClient, { authApi } from '../services/api';
import Button from '../components/Button';
import BooleanSelector from '../components/BooleanSelector';
import InputField from '../components/InputField';
import ProvinceSelector from '../components/ProvinceSelector';
import TextField from '../components/TextField';
import PawOff from '../icons/PawOff';
import WithDog from '../icons/WithDog';
import WalkDog from '../icons/WalkDog';
import SmolDog from '../icons/SmolDog';
import BigDog from '../icons/BigDog';
import HealthDog from '../icons/HealthDog';
import HoldDog from '../icons/HoldDog';
import RestingDog from '../icons/RestingDog';
import RunningDog from '../icons/RunningDog';
import MovingDog from '../icons/MovingDog';
import {
  ArrowLeft, 
  ArrowRight,
  Building,
  BookUser,
  Mail, 
  Lock, 
  Phone, 
  Home, 
  Heart, 
  Users, 
  PawPrint, 
  Clock,
  MapPin,
  Baby,
  Briefcase,
  UserCheck,
  FileUser,
  SquarePen,
  Eye,
  EyeOff,
  Ban
} from 'lucide-react';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tipo: 'USUARIO', // Always default to Usuario
    telefono: '',
    nombre: '',
    biografia: '',
    provincia: null,
    nombre_empresa: '', // Not used in regular onboarding
    tiene_ninos: false,
    tiene_otros_animales: false,
    tipo_vivienda: false,
    prefiere_pequenos: false,
    disponible_para_paseos: false,
    acepta_enfermos: false,
    acepta_viejos: false,
    busca_tranquilo: false,
    tiene_trabajo: false,
    animal_estara_solo: false
  });  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Email availability checking state
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle'); // 'idle', 'checking', 'available', 'unavailable'
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);
  
  // Track whether user has attempted to submit each step
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  
  // Track submission attempts to trigger icon wiggle animation
  const [submissionCounter, setSubmissionCounter] = useState(0);
  
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useAlert();
    // Registration steps configuration (7-step onboarding) - Updated count
  const steps = [
    {
      title: '¡Bienvenido!',
      subtitle: 'Comencemos con lo básico',
      icon: <UserCheck size={48} className="text-aquamarine-600" />,
      fields: ['email', 'telefono', 'password']
    },

    {
      title: '¿Cómo te llamas?',
      subtitle: 'Tu nombre lo verán los refugios al recibir tus peticiones de adopción',
      icon: <BookUser size={48} className="text-aquamarine-600" />,
      fields: ['nombre']
    },

    {
      title: 'Cuéntanos sobre ti',
      subtitle: 'Puedes escribir una breve biografía si lo deseas, será tu carta de presentación para los refugios',
      icon: <SquarePen size={48} className="text-aquamarine-600" />,
      fields: ['nombre']
    },

    {
      title: 'Tu ubicación',
      subtitle: (
        <>
          Te mostraremos mascotas de<br />
          refugios en tu provincia
        </>
      ),
      icon: <MapPin size={48} className="text-aquamarine-600" />,
      fields: ['provincia']
    },

    {
      title: 'Tu hogar',
      subtitle: 'Cuéntanos sobre tu vivienda',
      icon: <Home size={48} className="text-aquamarine-600" />,
      fields: ['tipo_vivienda', 'tiene_ninos', 'tiene_otros_animales']
    },    
    
    {
      title: 'Tu estilo de vida',
      subtitle: 'Información sobre tu rutina diaria',
      icon: <Briefcase size={48} className="text-aquamarine-600" />,
      fields: ['tiene_trabajo', 'animal_estara_solo', 'disponible_para_paseos']
    },    
    
    {
      title: 'Cuidado de mascotas',
      subtitle: '¿Estarías dispuesto a adoptar mascotas que necesitan cuidados especiales?',
      icon: <Heart size={48} className="text-aquamarine-600" />,
      fields: ['acepta_enfermos', 'acepta_viejos']
    },

    {
      title: 'Tipo de mascota',
      subtitle: 'Tamaño y personalidad ideales',
      icon: <PawPrint size={48} className="text-aquamarine-600" />,
      fields: ['prefiere_pequenos', 'busca_tranquilo']
    }
  ];  
  
  // Debounced email availability check
  const checkEmailAvailability = async (email) => {
    if (!email) {
      setEmailCheckStatus('idle');
      return;
    }

    // Basic email format validation first
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailCheckStatus('idle');
      return;
    }

    setEmailCheckStatus('checking');

    try {
      const response = await authApi.checkEmailAvailability(email);
      const { available } = response.data;
      
      setEmailCheckStatus(available ? 'available' : 'unavailable');
      
      // Update validation errors if email is not available
      if (!available) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Este email ya está registrado'
        }));
      } else {
        // Clear email error if it was about availability
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.email === 'Este email ya está registrado') {
            delete newErrors.email;
          }
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Email check error:', error);
      setEmailCheckStatus('idle');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing (only if there's an existing error)
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Special handling for email field - debounced availability check
    if (field === 'email') {
      setEmailCheckStatus('idle');
      
      // Clear existing timeout
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }
      
      // Set new timeout for email availability check
      const newTimeout = setTimeout(() => {
        checkEmailAvailability(value);
      }, 800); // 800ms debounce
      
      setEmailCheckTimeout(newTimeout);
    }
  };  const validateCurrentStep = () => {
    const errors = {};
    
    // Mark that user has attempted submission for this step
    setSubmissionAttempted(true);
    
    // Step 0: Basic info (email, phone, password)
    if (currentStep === 0) {
      // Validate email
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.message;
      } else if (emailCheckStatus === 'unavailable') {
        errors.email = 'Este email ya está registrado';
      } else if (emailCheckStatus === 'checking') {
        errors.email = 'Verificando disponibilidad...';
      }
      
      // Validate phone
      const phoneValidation = validateSpanishPhone(formData.telefono);
      if (!phoneValidation.isValid) {
        errors.telefono = phoneValidation.message;
      }
      
      // Validate password
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }
    
    // Step 1: Name validation
    if (currentStep === 1) {
      const nameValidation = validateName(formData.nombre);
      if (!nameValidation.isValid) {
        errors.nombre = nameValidation.message;
      }
    }
    
    // Step 2: Biography - no validation needed (optional field)
    // Step 2 is biography step, no validation required
    
    // Step 3: Province selection (updated step number)
    if (currentStep === 3) {
      if (!formData.provincia) {
        errors.provincia = 'Por favor, selecciona tu provincia';
      }
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
  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        // Reset submission attempted flag for next step
        setSubmissionAttempted(false);
      } else {
        handleSubmit();
      }
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      // Reset submission attempted flag when going back
      setSubmissionAttempted(false);
    }
  };const handleSubmit = async () => {
    setLoading(true);

    try {
      showInfo('Creando tu cuenta...');
      
      // Clean phone number before sending (remove +34 and spaces)
      const phoneValidation = validateSpanishPhone(formData.telefono);
      const cleanedFormData = {
        ...formData,
        telefono: phoneValidation.cleanPhone // Use cleaned phone number
      };
      
      // Make direct API call with cleaned data
      const response = await apiClient.post('/auth/register/', cleanedFormData);
      
      if (response.data) {
        showSuccess('¡Cuenta creada exitosamente!');
        
        // Registration successful, now try to login
        const loginResponse = await apiClient.post('/auth/login/', {
          email: formData.email,
          password: formData.password
        });
        
        if (loginResponse.data?.token) {
          localStorage.setItem('token', loginResponse.data.token);
          showSuccess('¡Bienvenido a NewTail!');
          navigate('/app');
        } else {
          showInfo('Cuenta creada. Por favor, inicia sesión.');
          navigate('/login?registered=true');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle 400 error specifically for email already registered
      if (err.response?.status === 400 && err.response?.data?.email) {
        // Set validation error for email field
        setValidationErrors({
          email: err.response.data.email[0] // Get the first error message for email
        });
        
        // Mark submission as attempted to show error
        setSubmissionAttempted(true);
        
        // Increment submission counter to trigger icon wiggle animation
        setSubmissionCounter(prev => prev + 1);
        
        // Go back to first step where email is entered
        setCurrentStep(0);
        
        // Show specific error message
        showError('Este email ya está registrado. Por favor, usa otro email.');
      } else {
        // Handle other errors
        showError(err.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get email input status for visual feedback
  const getEmailInputStatus = () => {
    if (emailCheckStatus === 'checking') {
      return { 
        rightElement: (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-aquamarine-600 rounded-full" />
          </div>
        ),
        iconColor: 'text-gray-400'
      };
    } else if (emailCheckStatus === 'unavailable') {
      return { 
        rightElement: null,
        iconColor: 'text-red-400'
      };
    }
    return { rightElement: null, iconColor: 'text-aquamarine-600' };
  };

// Step component renderers with adaptive spacing  
const renderBasicInfo = () => {
  const emailStatus = getEmailInputStatus();
  
  return (
    <div className="space-y-1 xs:space-y-1.5 sm:space-y-3 lg:space-y-4"> {/* Page 1: Ultra-tight spacing on iPhone SE for error message accommodation */}      
      <InputField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange('email', value)}
        placeholder="tu@email.com"
        leftIcon={<Mail size={18} className="sm:w-5 sm:h-5" />}
        rightElement={emailStatus.rightElement}
        iconColor={emailStatus.iconColor}
        error={submissionAttempted && !!validationErrors.email}
        errorMessage={submissionAttempted ? validationErrors.email : ''}
        submissionTrigger={submissionCounter}
      />

      <InputField
        id="telefono"
        label="Teléfono"
        type="tel"
        value={formData.telefono}
        onChange={(value) => handleInputChange('telefono', value)}
        placeholder="+34 123 456 789"
        leftIcon={<Phone size={18} className="sm:w-5 sm:h-5" />}
        error={submissionAttempted && !!validationErrors.telefono}
        errorMessage={submissionAttempted ? validationErrors.telefono : ''}
        submissionTrigger={submissionCounter}
      />      <InputField
        id="password"
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={(value) => handleInputChange('password', value)}
        placeholder="Mínimo 8 caracteres"
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
        required
      />
    </div>
  );
};

const renderNameInfo = () => (
 <div className="space-y-1 xs:space-y-1.5 sm:space-y-3 lg:space-y-4">
    <InputField
      id="nombre"
      label="Nombre Completo"
      type="text"
      value={formData.nombre}
      onChange={(value) => handleInputChange('nombre', value)}
      placeholder="Nombre y Apellido"
      leftIcon={<FileUser size={18} className="sm:w-5 sm:h-5" />}
      error={submissionAttempted && !!validationErrors.nombre}
      errorMessage={submissionAttempted ? validationErrors.nombre : ''}
      submissionTrigger={submissionCounter}
      required
    />
  </div> 
);

const renderBiographyInfo = () => (
  <div className="space-y-1 xs:space-y-1.5 sm:space-y-3 lg:space-y-4">
    <TextField
      id="biografia"
      label="Biografía (opcional)"
      value={formData.biografia}
      onChange={(value) => handleInputChange('biografia', value)}
      placeholder="Cuéntanos sobre ti..."
      maxLength={500}
      rows={6}
    />
  </div>
);

const renderProvinceSelection = () => (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6"> {/* Page 2: Province selection - Centered layout */}
      <ProvinceSelector
        value={formData.provincia}
        onChange={(value) => handleInputChange('provincia', value)}
        label="¿En qué provincia vives?"
        placeholder="Selecciona tu provincia"
        id="provincia"
        labelSize="lg"
        labelColor="text-gray-800"
        error={submissionAttempted && !!validationErrors.provincia}
        errorMessage={submissionAttempted ? validationErrors.provincia : ''}
        submissionTrigger={submissionCounter}
        required
      />
    </div>
  );

  const renderHomeInfo = () => (
    <div className="space-y-2.5 sm:space-y-3.5 lg:space-y-5"> {/* Page 3: Slightly increased spacing for 3 components, more space on large screens */}
      
      <BooleanSelector
        question="¿Vives en casa o apartamento?"
        value={formData.tipo_vivienda}
        onChange={(value) => handleInputChange('tipo_vivienda', value)}
        trueIcon={<Home size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<Building size={20} className="sm:w-6 sm:h-6" />}
        trueLabel="Casa"
        falseLabel="Apartamento"
      />

      <BooleanSelector
        question="¿Hay niños en casa?"
        value={formData.tiene_ninos}
        onChange={(value) => handleInputChange('tiene_ninos', value)}
        trueIcon={<Baby size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<Users size={20} className="sm:w-6 sm:h-6" />}
      />

      <BooleanSelector
        question="¿Tienes otras mascotas?"
        value={formData.tiene_otros_animales}
        onChange={(value) => handleInputChange('tiene_otros_animales', value)}
        trueIcon={<PawPrint size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<PawOff size={20} className="sm:w-6 sm:h-6" />}
      />    </div>
  );

const renderLifestyleInfo = () => (
    <div className="space-y-2.5 sm:space-y-3.5 lg:space-y-5"> {/* Page 4: Slightly increased spacing for 3 components, more space on large screens */}
      <BooleanSelector
        question="¿Tienes actualmente empleo o ingresos estables?"
        value={formData.tiene_trabajo}
        onChange={(value) => handleInputChange('tiene_trabajo', value)}
        trueIcon={<Briefcase size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<Ban size={20} className="sm:w-6 sm:h-6" />}
      />      
      
      <BooleanSelector
        question="¿La mascota estaría sola muchas horas?"
        value={formData.animal_estara_solo}
        onChange={(value) => handleInputChange('animal_estara_solo', value)}
        trueIcon={<Clock size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<WithDog size={20} className="sm:w-6 sm:h-6" />}
      />

      <BooleanSelector
        question="¿Estarías disponible para paseos?"
        value={formData.disponible_para_paseos}
        onChange={(value) => handleInputChange('disponible_para_paseos', value)}
        trueIcon={<WalkDog size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<Home size={20} className="sm:w-6 sm:h-6" />}
      />
    </div>
  );

const renderPetHealthPreferences = () => (
    <div className="space-y-3.5 sm:space-y-4.5 lg:space-y-5"> {/* Page 5: Slightly increased spacing for 2 components */}
      <BooleanSelector
        question="¿Adoptarías una mascota con problemas de salud?"
        value={formData.acepta_enfermos}
        onChange={(value) => handleInputChange('acepta_enfermos', value)}
        trueIcon={<HealthDog size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<PawPrint size={20} className="sm:w-6 sm:h-6" />}
      />

      <BooleanSelector
        question="¿Adoptarías una mascota con muchos años de edad?"
        value={formData.acepta_viejos}
        onChange={(value) => handleInputChange('acepta_viejos', value)}
        trueIcon={<HoldDog size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<RunningDog size={20} className="sm:w-6 sm:h-6" />}
      />
    </div>
  );

const renderPetTypePreferences = () => (
    <div className="space-y-3.5 sm:space-y-4.5 lg:space-y-5"> {/* Page 6: Slightly increased spacing for 2 components */}      <BooleanSelector
        question="¿Prefieres mascotas pequeñas?"
        value={formData.prefiere_pequenos}
        onChange={(value) => handleInputChange('prefiere_pequenos', value)}
        trueIcon={<SmolDog size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<BigDog size={20} className="sm:w-6 sm:h-6" />}
    />

      <BooleanSelector
        question="¿Buscas una mascota tranquila?"
        value={formData.busca_tranquilo}
        onChange={(value) => handleInputChange('busca_tranquilo', value)}
        trueIcon={<RestingDog size={20} className="sm:w-6 sm:h-6" />}
        falseIcon={<MovingDog size={20} className="sm:w-6 sm:h-6" />} />
    </div>
  );  const getButtonIcon = () => {
    if (loading) {
      return <div className="animate-spin h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 border-2 border-t-transparent border-white rounded-full" />;
    }
    if (currentStep === steps.length - 1) {
      return <UserCheck size={16} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />;
    }
    return <ArrowRight size={16} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />;
  };const getButtonText = () => {
    if (loading) {
      return 'Creando cuenta...';
    }
    if (currentStep === steps.length - 1) {
      return 'Crear cuenta';
    }
    if (currentStep === 0) {
      return 'Comenzar';
    }
    return 'Seguir';
  };

  const getMobileButtonText = () => {
    if (loading) return 'Creando...';
    if (currentStep === steps.length - 1) return 'Crear';
    if (currentStep === 0) return 'Empezar';
    return 'Seguir';
  };
  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderNameInfo();
      case 2: return renderBiographyInfo();
      case 3: return renderProvinceSelection();
      case 4: return renderHomeInfo();
      case 5: return renderLifestyleInfo();
      case 6: return renderPetHealthPreferences();
      case 7: return renderPetTypePreferences();
      default: return null;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex flex-col">      {/* Header with back to home button - Responsive height */}
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
                      lg:min-h-[calc(100vh-80px)]"><div className="w-full flex flex-col
                        max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl
                        h-full">            {/* Progress Indicator - Reduced spacing on mobile */}
          <div className="flex justify-center space-x-2 mb-2 sm:mb-3 lg:mb-4 flex-shrink-0"
               style={{ height: '16px' }}>
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-aquamarine-600' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>          {/* Card Container - Ultra-responsive for small screens like iPhone SE, with extra space for error messages */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 
                       flex flex-col
                       p-2 xs:p-3 sm:p-4 lg:p-6
                       h-[clamp(540px,72vh,680px)] sm:h-[clamp(520px,65vh,680px)] lg:h-[clamp(620px,75vh,800px)]"
            style={{
              minHeight: currentStep === 0 ? '540px' : '480px' // Extra height for first step with 3 error messages (increased for iPhone SE)
            }}
          >            {/* Step Header - Ultra-compact on tiny screens for maximum content space */}
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
                  {steps[currentStep].icon}
                </div>
              </motion.div>              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl 
                           np-bold text-gray-800 mb-1 xs:mb-1 sm:mb-2
                           leading-tight"
              >
                {steps[currentStep].title}
              </motion.h1>              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg xs:text-xl sm:text-lg lg:text-xl xl:text-2xl 
                           text-gray-600 np-regular
                           leading-tight"
              >
                {steps[currentStep].subtitle}
              </motion.p>
            </div>            {/* Step Content - Ultra-flexible for small screens, prioritizes fitting inputs with error messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1 flex flex-col justify-center 
                         px-1 xs:px-2 sm:px-2 lg:px-4
                         py-1 xs:py-1.5 sm:py-2 lg:py-3
                         min-h-[clamp(260px,58%,360px)] xs:min-h-[clamp(280px,60%,380px)] sm:min-h-[clamp(220px,50%,320px)] lg:min-h-[clamp(280px,55%,400px)]"
            ><div className="space-y-1 sm:space-y-2">
                {getCurrentStepContent()}
              </div>
            </motion.div>            {/* Navigation Buttons - Reduced spacing on mobile for better fit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex-shrink-0 mt-1 sm:mt-2 lg:mt-4"
            ><div className="flex justify-center gap-3 sm:gap-4">                {/* Back Button - only show if not on first step */}
                {currentStep > 0 && (                  <Button
                    onClick={prevStep}
                    disabled={loading}
                    className="py-3 xs:py-3 sm:py-3 text-sm xs:text-sm sm:text-base 
                               np-bold min-h-[44px] xs:min-h-[44px] sm:min-h-[44px] lg:min-h-[48px]
                               px-6 xs:px-8 sm:px-8 lg:px-10
                               min-w-[120px] xs:min-w-[140px] sm:min-w-[140px] lg:min-w-[160px]"
                    variant="outline-marine"
                    size="lg"
                    leftIcon={<ArrowLeft size={16} className="xs:w-4 xs:h-4 sm:w-4 sm:h-4" />}
                  >
                    <span className="hidden sm:inline">Atrás</span>
                    <span className="sm:hidden">Volver</span>
                  </Button>
                )}
                  {/* Next/Submit Button */}                <Button
                  onClick={nextStep}
                  disabled={loading}
                  className="py-3 xs:py-3 sm:py-3 text-sm xs:text-base sm:text-base 
                             np-bold min-h-[44px] xs:min-h-[44px] sm:min-h-[44px] lg:min-h-[48px]
                             px-6 xs:px-8 sm:px-8 lg:px-10
                             min-w-[120px] xs:min-w-[140px] sm:min-w-[140px] lg:min-w-[160px]"
                  variant="primary"
                  size="lg"
                  rightIcon={getButtonIcon()}
                ><span className="truncate">
                    <span className="hidden sm:inline">{getButtonText()}</span>
                    <span className="sm:hidden">{getMobileButtonText()}</span>
                  </span>
                </Button>
              </div>
            </motion.div></motion.div>          {/* Login Link - Reduced height and spacing for mobile optimization */}
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
          ><div>
              <span className="text-white/80 np-regular text-sm sm:text-base">¿Ya tienes cuenta? </span>
              <Link to="/login" className="text-aquamarine-600 hover:text-aquamarine-500 
                                           np-bold transition-colors text-sm sm:text-base">
                Inicia sesión
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
