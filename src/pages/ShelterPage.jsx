import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import HomePageLayout from '../layouts/HomePageLayout';
import { ArrowRight, Check, PawPrint, Heart, Building, Shield, Users, Mail, MapPin, Send, Target, Zap, TrendingUp, BarChart, Phone } from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';
import TextField from '../components/TextField';
import ProvinceSelector from '../components/ProvinceSelector';
import { useAlert } from '../hooks/useAlert';
import { validateSpanishPhone, validateTextField } from '../utils/validation';
import { contactApi } from '../services/api';

// Improved animation component that only animates on scroll down
function AnimatedSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
  // Only animate elements when they come into view for the first time
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);
  
  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, delay: delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Success Modal Component
function SuccessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        
        <h3 className="text-xl np-bold text-gray-900 mb-2">
          ¡Solicitud enviada!
        </h3>
        
        <p className="text-gray-600 np-regular mb-6">
          Hemos recibido tu solicitud. Nuestro equipo se pondrá en contacto contigo en las próximas 48 horas para iniciar el proceso de registro.
        </p>
        
        <Button
          onClick={onClose}
          variant="primary"
          className="w-full"
        >
          Entendido
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function ShelterPage() {
  // Parallax effect for hero section
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 50]);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    email: '',
    telefono: '',
    provincia: null,
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submissionTrigger, setSubmissionTrigger] = useState(0);
  const { showError } = useAlert();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate nombre_empresa
    if (!formData.nombre_empresa.trim()) {
      errors.nombre_empresa = 'El nombre del refugio es obligatorio';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Por favor, introduce un email válido';
    }
    
    // Validate telefono
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else {
      const phoneValidation = validateSpanishPhone(formData.telefono);
      if (!phoneValidation.isValid) {
        errors.telefono = phoneValidation.message;
      }
    }
    
    // Validate provincia
    if (!formData.provincia) {
      errors.provincia = 'Selecciona tu provincia';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmissionTrigger(prev => prev + 1); // Trigger wiggle animation
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare the phone number for the backend
      const phoneValidation = validateSpanishPhone(formData.telefono);
      const cleanPhone = phoneValidation.cleanPhone;
      
      // Validate and clean the mensaje field
      const messageValidation = validateTextField(formData.mensaje, false);
      const cleanMessage = messageValidation.cleanText;
      
      // Build request body matching the ContactForm model
      const requestBody = {
        nombre_empresa: formData.nombre_empresa.trim(),
        email: formData.email.trim(),
        telefono: cleanPhone,
        provincia: formData.provincia, // Include provincia in the request
        mensaje: cleanMessage // Use cleaned message without line breaks
      };
      
      // Make actual API call to /api/empresa/ endpoint
      await contactApi.submitContactForm(requestBody);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        nombre_empresa: '',
        email: '',
        telefono: '',
        provincia: null,
        mensaje: ''
      });
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      if (error.response?.status === 400) {
        // Handle validation errors from backend
        showError('Error en los datos del formulario. Verifica la información.');
      } else {
        showError('Error al enviar la solicitud. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomePageLayout>
      <div className="min-h-screen flex flex-col hide-scrollbar overflow-x-hidden">
        {/* Split Hero Section - Different from HomePage */}
        <section className="min-h-screen bg-gradient-to-br from-oxford-900 via-marine-800 to-oxford-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-aquamarine-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-20 w-48 h-48 bg-orchid-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-aquamarine-400 rounded-full blur-2xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-aquamarine-400">
                  <Building size={18} />
                  <span className="text-sm np-medium">Para refugios y protectoras</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl text-white np-bold leading-tight">
                  Conecta más.
                  <br />
                  <span className="text-aquamarine-400">Adopta mejor.</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-200 np-light max-w-lg">
                  NewTail amplifica el alcance de tu refugio y conecta tus mascotas con las familias perfectas en tu provincia.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                    variant="secondary"
                    size="lg"
                    className="np-bold"
                    leftIcon={<Send size={20} />}
                  >
                    Solicitar información
                  </Button>
                  
                  <Button 
                    onClick={() => document.getElementById('benefits').scrollIntoView({ behavior: 'smooth' })}
                    variant="outline"
                    size="lg"
                    className="np-medium"
                    rightIcon={<ArrowRight size={20} />}
                  >
                    Ver beneficios
                  </Button>
                </div>
              </motion.div>

              {/* Right Stats Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 gap-6"
              >
                {[
                  {icon: Target, label: 'Adopciones exitosas', value: '100+', color: 'bg-aquamarine-500' },
                  { icon: Building, label: 'Refugios activos', value: '10+', color: 'bg-orchid-500' },
                  { icon: TrendingUp, label: 'Tasa de adopción', value: '87%', color: 'bg-aquamarine-500' },
                  { icon: Users, label: 'Familias felices', value: '95+', color: 'bg-orchid-500' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                      <stat.icon size={24} className="text-white" />
                    </div>
                    <div className="text-2xl lg:text-3xl np-bold text-white mb-1">{stat.value}</div>
                    <div className="text-gray-300 np-regular text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problem-Solution Section - Different approach */}
        <section className="py-20 bg-white relative z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <AnimatedSection>
                <div className="inline-flex items-center gap-2 bg-orchid-100 text-orchid-700 px-4 py-2 rounded-full mb-6">
                  <BarChart size={18} />
                  <span className="text-sm np-medium">El reto de las adopciones</span>
                </div>
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  De la <span className="text-orchid-500">saturación</span> al <span className="text-aquamarine-500">éxito</span>
                </h2>
                <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto">
                  Sabemos los desafíos que enfrentan los refugios. NewTail transforma el proceso de adopción.
                </p>
              </AnimatedSection>
            </div>

            {/* Before/After Comparison */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Before - Problems */}
              <AnimatedSection delay={0.1}>
                <div className="bg-gray-50 rounded-2xl p-8 border-l-4 border-gray-400 shadow-lg shadow-gray-200/40">
                  <h3 className="text-2xl np-bold text-gray-700 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white np-bold">!</span>
                    </div>
                    Antes de NewTail
                  </h3>
                  <div className="space-y-4">
                    {[
                      'Alcance limitado a redes sociales dispersas',
                      'Filtrado manual de adoptantes potenciales',
                      'Gestión desorganizada de peticiones',
                      'Dificultad para encontrar hogares específicos',
                      'Tiempo excesivo en coordinación y seguimiento'
                    ].map((problem, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600 np-regular">{problem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* After - Solutions */}
              <AnimatedSection delay={0.2}>
                <div className="bg-aquamarine-50 rounded-2xl p-8 border-l-4 border-aquamarine-500 shadow-lg shadow-aquamarine-200/40">
                  <h3 className="text-2xl np-bold text-oxford-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-aquamarine-500 rounded-full flex items-center justify-center">
                      <Zap size={20} className="text-white" />
                    </div>
                    Con NewTail
                  </h3>
                  <div className="space-y-4">
                    {[
                      'Exposición automática a adoptantes comprometidos',
                      'Sistema inteligente de compatibilidad',
                      'Panel centralizado de gestión',
                      'Matching específico por características',
                      'Automatización de procesos repetitivos'
                    ].map((solution, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-aquamarine-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-white np-bold" />
                        </div>
                        <span className="text-oxford-900 np-medium">{solution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Call to Action */}
            <AnimatedSection delay={0.3}>
              <div className="text-center mt-12">
                <Button 
                  onClick={() => document.getElementById('benefits').scrollIntoView({ behavior: 'smooth' })}
                  variant="cta"
                  size="lg"
                  className="np-bold"
                  rightIcon={<ArrowRight size={20} />}
                >
                  Descubre los beneficios
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* How It Works Section - Process Focused */}
        <section className="py-20 bg-oxford-50" id="how-it-works">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-marine-100 text-marine-700 px-4 py-2 rounded-full mb-6">
                  <Target size={18} />
                  <span className="text-sm np-medium">Proceso simplificado</span>
                </div>
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  Tres pasos hacia más <span className="text-orchid-500">adopciones</span>
                </h2>
                <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto">
                  Nuestro proceso está diseñado para maximizar las adopciones exitosas con el mínimo esfuerzo
                </p>
              </div>
            </AnimatedSection>

            {/* Process Steps */}
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Regístrate y configura',
                  description: 'Crea tu cuenta empresarial y configura tu perfil de refugio. Agrega la información de tus mascotas con nuestro sistema fácil de usar.',
                  icon: Building,
                  color: 'aquamarine'
                },
                {
                  step: '02',
                  title: 'Recibe peticiones',
                  description: 'Nuestro algoritmo conecta tus mascotas con adoptantes compatibles de tu provincia. Recibe peticiones pre-filtradas y relevantes.',
                  icon: Users,
                  color: 'orchid'
                },
                {
                  step: '03',
                  title: 'Gestiona adopciones',
                  description: 'Acepta o rechaza peticiones desde tu panel. Mantén comunicación directa con los adoptantes y haz seguimiento del proceso.',
                  icon: Heart,
                  color: 'aquamarine'
                }
              ].map((step, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <div className="relative">
                    {/* Connector Line */}
                    {index < 2 && (
                      <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-orchid-200 to-aquamarine-200 z-0"></div>
                    )}
                    
                    <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-300/20 border border-gray-100 relative z-10 hover:shadow-2xl hover:shadow-gray-400/25 transition-all duration-300">
                      {/* Step Number */}
                      <div className="text-right mb-4">
                        <span className="text-6xl np-extrabold text-gray-100">{step.step}</span>
                      </div>

                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-xl mb-6 flex items-center justify-center ${
                        step.color === 'aquamarine' ? 'bg-aquamarine-500' : 'bg-orchid-500'
                      }`}>
                        <step.icon size={32} className="text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl np-bold text-oxford-900 mb-4">{step.title}</h3>
                      <p className="text-gray-600 np-regular leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            {/* Bottom CTA */}
            <AnimatedSection delay={0.4}>
              <div className="text-center mt-16">
                <p className="text-gray-500 np-regular mb-6">¿Listo para comenzar?</p>
                <Button 
                  onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                  variant="primary"
                  size="lg"
                  className="np-bold"
                  rightIcon={<Send size={20} />}
                >
                  Solicitar acceso
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white" id="benefits">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <div className="relative">
                  <div className="rounded-xl overflow-hidden shadow-xl shadow-gray-200/60">
                    <img 
                      src="/images/shelter-team.jpg" 
                      alt="Equipo de refugio" 
                      className="w-full h-auto"
                      onError={(e) => {
                        e.target.src = "https://images.pexels.com/photos/7788020/pexels-photo-7788020.jpeg";
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-5 -right-5 bg-aquamarine-400 rounded-lg p-6 shadow-lg">
                    <p className="text-2xl np-bold text-oxford-900">98%</p>
                    <p className="text-oxford-900 np-medium">Satisfacción de refugios</p>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={0.2}>
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  Beneficios para tu <span className="text-orchid-500">refugio</span>
                </h2>
                <p className="text-lg text-gray-600 np-regular mb-4">
                  NewTail está diseñado específicamente para facilitar el trabajo de refugios y protectoras, 
                  conectándote con adoptantes previamente evaluados que buscan mascotas con características específicas.
                </p>
                <p className="text-lg text-gray-600 np-regular mb-8">
                  Nuestro sistema de compatibilidad asegura que recibas peticiones de personas realmente interesadas 
                  y adecuadas para cada una de tus mascotas.
                </p>
                
                <ul className="space-y-3">
                  {[
                    "Mayor visibilidad para tus mascotas en adopción",
                    "Adoptantes preseleccionados según criterios específicos",
                    "Comunicación directa y segura con los adoptantes",
                    "Panel de gestión intuitivo y fácil de usar",
                    "Soporte técnico dedicado para refugios"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-aquamarine-400 text-oxford-900">
                        <Check size={16} className="np-bold" />
                      </div>
                      <span className="text-gray-700 np-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 bg-oxford-50" id="success-stories">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-4 text-center">
                Historias de <span className="text-orchid-500">éxito</span>
              </h2>
              <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto text-center mb-16">
                Refugios que ya confían en NewTail para encontrar hogares para sus mascotas
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Refugio Esperanza",
                  province: "Madrid",
                  testimonial: "En 6 meses hemos conseguido 25 adopciones exitosas. La plataforma nos ahorra mucho tiempo en la preselección.",
                  adoptions: "25 adopciones"
                },
                {
                  name: "Protectora Animal Valencia",
                  province: "Valencia", 
                  testimonial: "Los adoptantes que llegan a través de NewTail vienen ya informados y comprometidos. Es una gran diferencia.",
                  adoptions: "22 adopciones"
                },
                {
                  name: "Asociación Patitas",
                  province: "Sevilla",
                  testimonial: "La gestión centralizada nos permite atender mejor a cada petición. Recomendamos NewTail a otros refugios.",
                  adoptions: "18 adopciones"
                }
              ].map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orchid-500 rounded-full flex items-center justify-center mr-4">
                      <Building className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg np-bold text-oxford-900">{story.name}</h3>
                      <p className="text-sm text-gray-600">{story.province}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 np-regular mb-4 italic">
                    "{story.testimonial}"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-aquamarine-600 np-bold text-sm">{story.adoptions}</span>
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-marine-800 text-white" id="contact-form">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-aquamarine-500 text-oxford-900 mb-6">
                  <Heart size={20} className="mr-2" /> 
                  <span className="text-sm np-medium">Únete a la red de refugios de NewTail</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl np-bold mb-6">
                  Solicita información para <span className="text-aquamarine-400">unirte</span>
                </h2>
                <p className="text-lg text-gray-300 np-regular max-w-2xl mx-auto">
                  Completa este formulario y nuestro equipo se pondrá en contacto contigo para explicarte 
                  cómo NewTail puede ayudar a tu refugio a encontrar hogares para vuestras mascotas.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Nombre del refugio"
                    value={formData.nombre_empresa}
                    onChange={(value) => handleInputChange('nombre_empresa', value)}
                    placeholder="Ej: Refugio Esperanza"
                    leftIcon={<Building size={18} />}
                    error={!!validationErrors.nombre_empresa}
                    errorMessage={validationErrors.nombre_empresa}
                    submissionTrigger={submissionTrigger}
                    required
                  />

                  <InputField
                    label="Email de contacto"
                    type="email"
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    placeholder="info@refugio.com"
                    leftIcon={<Mail size={18} />}
                    error={!!validationErrors.email}
                    errorMessage={validationErrors.email}
                    submissionTrigger={submissionTrigger}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <InputField
                    label="Teléfono de contacto"
                    type="tel"
                    value={formData.telefono}
                    onChange={(value) => handleInputChange('telefono', value)}
                    placeholder="Ej: 600 123 456"
                    leftIcon={<Phone size={18} />}
                    error={!!validationErrors.telefono}
                    errorMessage={validationErrors.telefono}
                    submissionTrigger={submissionTrigger}
                    required
                  />

                  <div className="space-y-2">
                    <ProvinceSelector
                      value={formData.provincia}
                      onChange={(value) => handleInputChange('provincia', value)}
                      label="¿En qué provincia se encuentra el refugio?"
                      placeholder="Selecciona tu provincia"
                      id="provincia-refugio"
                      labelSize="base"
                      labelColor="text-gray-700"
                      error={!!validationErrors.provincia}
                      errorMessage={validationErrors.provincia}
                      submissionTrigger={submissionTrigger}
                      required
                      className="h-full flex flex-col justify-start"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <TextField
                    id="mensaje"
                    label="Mensaje adicional (opcional)"
                    value={formData.mensaje}
                    onChange={(value) => handleInputChange('mensaje', value)}
                    placeholder="Puedes contarnos sobre tu refugio, número de animales, inquietudes que tengas..."
                    rows={4}
                    validateInput={true}
                    submissionTrigger={submissionTrigger}
                  />
                </div>

                <div className="mt-8 flex justify-center">
                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    disabled={loading}
                    className={`np-bold transition-all duration-200 ${
                      loading 
                        ? 'opacity-90 cursor-not-allowed !bg-aquamarine-400 hover:!bg-aquamarine-400 active:!bg-aquamarine-400' 
                        : 'hover:scale-105 active:scale-95'
                    }`}
                    rightIcon={loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-oxford-900/60" />
                    ) : (
                      <Send size={20} />
                    )}
                  >
                    {loading ? 'Enviando...' : 'Enviar solicitud'}
                  </Button>
                </div>
              </form>
            </AnimatedSection>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-oxford-900 text-white text-center">
          <AnimatedSection>
            <PawPrint size={48} className="text-aquamarine-400 mx-auto mb-4" />
            <h3 className="text-3xl md:text-5xl np-bold mb-6">
              ¿Eres adoptante?
            </h3>
            <p className="text-lg text-gray-300 np-regular mb-10 max-w-xl mx-auto">
              Si buscas adoptar una mascota, regístrate en nuestra plataforma y encuentra a tu compañero perfecto.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="np-medium w-full sm:w-auto"
                  rightIcon={<ArrowRight size={20} />}
                >
                  Adoptar una mascota
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </section>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
    </HomePageLayout>
  );
}