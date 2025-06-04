import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';
import BooleanSelector from '../components/BooleanSelector';
import InputField from '../components/InputField';
import ProvinceSelector from '../components/ProvinceSelector';
import apiClient from '../services/api';
import { 
  ArrowLeft, 
  ArrowRight, 
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
  UserCheck
} from 'lucide-react';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tipo: 'USUARIO', // Always default to Usuario
    telefono: '',
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
  const [error, setError] = useState('');
  const navigate = useNavigate();
    // Registration steps configuration (6-step onboarding)
  const steps = [
    {
      title: '¡Bienvenido!',
      subtitle: 'Comencemos con lo básico',
      icon: <UserCheck size={48} className="text-aquamarine-600" />,
      fields: ['email', 'telefono', 'password']
    },
    {
      title: 'Tu ubicación',
      subtitle: 'Selecciona tu provincia',
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
      subtitle: 'Tus preferencias personales',
      icon: <Briefcase size={48} className="text-aquamarine-600" />,
      fields: ['tiene_trabajo', 'animal_estara_solo', 'disponible_para_paseos']
    },
    {
      title: 'Cuidado de mascotas',
      subtitle: 'Tu experiencia con mascotas especiales',
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateCurrentStep = () => {
    // Step 0: Basic info (email, phone, password)
    if (currentStep === 0) {
      if (!formData.email || !formData.telefono || !formData.password) {
        setError('Por favor, completa todos los campos requeridos');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }
    
    // Step 1: Province selection
    if (currentStep === 1) {
      if (!formData.provincia) {
        setError('Por favor, selecciona tu provincia');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Make direct API call with ngrok headers
      const response = await apiClient.post('/auth/register/', formData);
      
      if (response.data) {
        // Registration successful, now try to login
        const loginResponse = await apiClient.post('/auth/login/', {
          email: formData.email,
          password: formData.password
        });
        
        if (loginResponse.data?.token) {
          localStorage.setItem('token', loginResponse.data.token);
          navigate('/app');
        } else {
          navigate('/login?registered=true');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };  // Step component renderers
  const renderBasicInfo = () => (
    <div className="space-y-6"> {/* Page 1: Basic info */}
      <InputField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange('email', value)}
        placeholder="tu@email.com"
        leftIcon={<Mail size={20} />}
      />

      <InputField
        id="telefono"
        label="Teléfono"
        type="tel"
        value={formData.telefono}
        onChange={(value) => handleInputChange('telefono', value)}
        placeholder="+34 123 456 789"
        leftIcon={<Phone size={20} />}
      />

      <InputField
        id="password"
        label="Contraseña"
        type="password"
        value={formData.password}
        onChange={(value) => handleInputChange('password', value)}
        placeholder="Mínimo 6 caracteres"
        leftIcon={<Lock size={20} />}
      />
    </div>
  );
  const renderProvinceSelection = () => (
    <div className="space-y-6"> {/* Page 2: Province selection */}
      <ProvinceSelector
        value={formData.provincia}
        onChange={(value) => handleInputChange('provincia', value)}
        label="¿En qué provincia vives?"
        placeholder="Selecciona tu provincia"
        id="provincia"
        labelSize="lg"
        labelColor="text-gray-800"
      />
    </div>
  );  const renderHomeInfo = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-3"> {/* Page 3: Reduced spacing for desktop to fit 3 components */}
      
      <BooleanSelector
        question="¿Vives en casa o apartamento?"
        value={formData.tipo_vivienda}
        onChange={(value) => handleInputChange('tipo_vivienda', value)}
        trueIcon={<Home size={24} />}
        falseIcon={<Home size={24} />}
        trueLabel="Casa"
        falseLabel="Apartamento"
      />

      <BooleanSelector
        question="¿Hay niños en casa?"
        value={formData.tiene_ninos}
        onChange={(value) => handleInputChange('tiene_ninos', value)}
        trueIcon={<Baby size={24} />}
        falseIcon={<Users size={24} />}
      />

      <BooleanSelector
        question="¿Tienes otras mascotas?"
        value={formData.tiene_otros_animales}
        onChange={(value) => handleInputChange('tiene_otros_animales', value)}
        trueIcon={<PawPrint size={24} />}
        falseIcon={<Heart size={24} />}
      />
    </div>
  );const renderLifestyleInfo = () => (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6"> {/* Page 4: Fixed spacing between components */}
      <BooleanSelector
        question="¿Trabajas fuera de casa?"
        value={formData.tiene_trabajo}
        onChange={(value) => handleInputChange('tiene_trabajo', value)}
        trueIcon={<Briefcase size={24} />}
        falseIcon={<Home size={24} />}
      />

      <BooleanSelector
        question="¿La mascota estaría sola muchas horas?"
        value={formData.animal_estara_solo}
        onChange={(value) => handleInputChange('animal_estara_solo', value)}
        trueIcon={<Clock size={24} />}
        falseIcon={<Users size={24} />}
      />

      <BooleanSelector
        question="¿Estarías disponible para paseos?"
        value={formData.disponible_para_paseos}
        onChange={(value) => handleInputChange('disponible_para_paseos', value)}
        trueIcon={<PawPrint size={24} />}
        falseIcon={<Home size={24} />}
      />
    </div>  );const renderPetHealthPreferences = () => (
    <div className="space-y-3 sm:space-y-4"> {/* Page 5: Pet health preferences */}
      <BooleanSelector
        question="¿Adoptarías una mascota con problemas de salud?"
        value={formData.acepta_enfermos}
        onChange={(value) => handleInputChange('acepta_enfermos', value)}
        trueIcon={<Heart size={24} />}
        falseIcon={<PawPrint size={24} />}
      />

      <BooleanSelector
        question="¿Adoptarías una mascota mayor?"
        value={formData.acepta_viejos}
        onChange={(value) => handleInputChange('acepta_viejos', value)}
        trueIcon={<Heart size={24} />}
        falseIcon={<PawPrint size={24} />}
      />
    </div>
  );      const renderPetTypePreferences = () => (
    <div className="space-y-3 sm:space-y-4"> {/* Page 6: Pet type preferences */}
      <BooleanSelector
        question="¿Prefieres mascotas pequeñas?"
        value={formData.prefiere_pequenos}
        onChange={(value) => handleInputChange('prefiere_pequenos', value)}
        trueIcon={<PawPrint size={20} />}
        falseIcon={<PawPrint size={24} />}
      />

      <BooleanSelector
        question="¿Buscas una mascota tranquila?"
        value={formData.busca_tranquilo}
        onChange={(value) => handleInputChange('busca_tranquilo', value)}
        trueIcon={<Heart size={24} />}
        falseIcon={<PawPrint size={24} />}
      />
    </div>
  );

  const getButtonIcon = () => {
    if (loading) {
      return <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full" />;
    }
    if (currentStep === steps.length - 1) {
      return <UserCheck size={20} />;
    }
    return <ArrowRight size={20} />;
  };  const getButtonText = () => {
    if (loading) {
      return 'Creando cuenta...';
    }
    if (currentStep === steps.length - 1) {
      return 'Crear cuenta';
    }
    if (currentStep === 0) {
      return 'Comenzar';
    }
    return 'Continuar';
  };
  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderProvinceSelection();
      case 2: return renderHomeInfo();
      case 3: return renderLifestyleInfo();
      case 4: return renderPetHealthPreferences();
      case 5: return renderPetTypePreferences();
      default: return null;
    }
  };
    return (
    <div className="h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex flex-col overflow-hidden">      {/* Header with back to home button - Fixed height */}
      <div className="flex justify-between items-center px-4 py-2 sm:py-3 lg:px-8 flex-shrink-0 h-12 sm:h-14 lg:h-16">
        {/* Back to Home Button */}        <Link 
          to="/" 
          className="flex items-center text-white drop-shadow-sm hover:text-aquamarine-200 transition-colors p-2 space-x-2"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="np-medium text-sm sm:text-base">Volver al inicio</span>
        </Link>
        
        {/* Empty space for balance */}
        <div className="w-8"></div>
      </div>      {/* Main Content Card - Use remaining height */}
      <div className="flex-1 flex items-center justify-center px-3 py-1 sm:px-4 sm:py-2 lg:px-8 lg:py-3 min-h-0">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-full flex flex-col min-h-0">
          {/* Progress Indicator - Fixed height */}
          <div className="flex justify-center space-x-2 mb-1 sm:mb-2 lg:mb-3 flex-shrink-0">
            {steps.map((step, index) => (
              <div
                key={step.title}                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-aquamarine-600' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>          {/* Card Container - Use all available height */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 flex flex-col
                       flex-1 min-h-0
                       p-3 sm:p-4 lg:p-6"
          >{/* Step Header - Fixed height with consistent icon positioning */}
            <div className="text-center flex-shrink-0 py-2 sm:py-3 lg:py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-2 sm:mb-3 lg:mb-4 flex justify-center"
                style={{ 
                  paddingTop: '16px', // Consistent 16px from top border
                  paddingBottom: '8px' // Small bottom padding for balance
                }}
              >
                {steps[currentStep].icon}
              </motion.div>              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl sm:text-2xl lg:text-3xl np-bold text-gray-800 mb-1 sm:mb-2"
              >
                {steps[currentStep].title}
              </motion.h1>              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg lg:text-xl text-gray-600 np-regular"
              >
                {steps[currentStep].subtitle}
              </motion.p>
            </div>            {/* Step Content - Responsive container that fits content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden"
            >
              <div className="px-1">
                {getCurrentStepContent()}
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
            </AnimatePresence>            {/* Navigation Buttons - Fixed responsive layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex-shrink-0 mt-4 sm:mt-6"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Back Button - only show if not on first step */}
                {currentStep > 0 && (
                  <Button
                    onClick={prevStep}
                    disabled={loading}
                    className="flex-1 py-3 sm:py-4 text-sm sm:text-base lg:text-lg np-bold min-h-[48px] sm:min-h-[52px]"
                    variant="outline-marine"
                    size="lg"
                    leftIcon={<ArrowLeft size={18} className="sm:w-5 sm:h-5" />}
                  >
                    <span className="hidden sm:inline">Atrás</span>
                    <span className="sm:hidden">Volver</span>
                  </Button>
                )}
                  {/* Next/Submit Button */}
                <Button
                  onClick={nextStep}
                  disabled={loading}
                  className={`py-3 sm:py-4 text-sm sm:text-base lg:text-lg np-bold min-h-[48px] sm:min-h-[52px] ${currentStep === 0 ? 'w-full' : 'flex-1'}`}
                  variant="primary"
                  size="lg"
                  rightIcon={getButtonIcon()}
                >
                  <span className="truncate">
                    <span className="hidden sm:inline">{getButtonText()}</span>
                    <span className="sm:hidden">
                      {loading ? 'Creando...' : currentStep === steps.length - 1 ? 'Crear' : currentStep === 0 ? 'Empezar' : 'Seguir'}
                    </span>
                  </span>
                </Button>
              </div>
            </motion.div>
          </motion.div>          {/* Login Link - With bottom padding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-2 sm:mt-3 lg:mt-4 mb-3 sm:mb-4 lg:mb-5 flex-shrink-0"
          >
            <span className="text-white/80 np-regular text-sm sm:text-base">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-aquamarine-600 hover:text-aquamarine-500 np-medium transition-colors underline text-sm sm:text-base">
              Inicia sesión
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
