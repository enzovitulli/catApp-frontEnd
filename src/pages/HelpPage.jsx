import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'motion/react';
import HomePageLayout from '../layouts/HomePageLayout';
import { 
  HelpCircle, 
  Search, 
  Heart, 
  PawPrint, 
  Building, 
  Users, 
  Shield, 
  Mail, 
  Send,
  Check,
  MessageCircle,
  BookOpen,
  FileText,
  Phone
} from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';
import TextField from '../components/TextField';
import SearchInput from '../components/SearchInput';
import Accordion from '../components/Accordion';
import { useAlert } from '../hooks/useAlert';
import { validateEmail, validateTextField } from '../utils/validation';
import { contactApi } from '../services/api';

// Animation component
function AnimatedSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
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
          ¡Mensaje enviado!
        </h3>
        
        <p className="text-gray-600 np-regular mb-6">
          Hemos recibido tu consulta. Nuestro equipo te responderá en las próximas 24 horas.
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

export default function HelpPage() {
  // Parallax effect
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 50]);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Contact form state
  const [contactForm, setContactForm] = useState({
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submissionTrigger, setSubmissionTrigger] = useState(0);
  const { showError, showSuccess } = useAlert();

  // Sticky search refs and motion values
  const searchRef = useRef(null);
  const faqSectionRef = useRef(null);
  const accordionSectionRef = useRef(null);
  const contactSectionRef = useRef(null);
  
  // Simple docking state
  const [isSearchDocked, setIsSearchDocked] = useState(false);
  
  // Motion values for smooth animation
  const searchY = useMotionValue(0);
  
  // Spring animation for smooth movement
  const animatedY = useSpring(searchY, { damping: 25, stiffness: 300 });

  // FAQ Categories
  const faqCategories = [
    { id: 'all', label: 'Todas las preguntas', icon: BookOpen },
    { id: 'adoption', label: 'Proceso de adopción', icon: Heart },
    { id: 'platform', label: 'Uso de la plataforma', icon: PawPrint },
    { id: 'shelters', label: 'Para refugios', icon: Building },
    { id: 'account', label: 'Cuenta y perfil', icon: Users },
    { id: 'safety', label: 'Seguridad', icon: Shield }
  ];

  // Expanded FAQ content
  const faqData = [
    // Adoption Process
    {
      category: 'adoption',
      question: "¿Cómo funciona el proceso de adopción?",
      answer: "El proceso comienza creando una cuenta en nuestra plataforma. Luego, puedes explorar las mascotas disponibles, filtrarlas según tus preferencias y enviar una solicitud para la mascota que te interese. El refugio o organización revisará tu solicitud y se pondrá en contacto contigo para continuar con el proceso, que puede incluir una entrevista, visita al refugio y período de adaptación."
    },
    {
      category: 'adoption',
      question: "¿Qué requisitos necesito para adoptar?",
      answer: "Los requisitos varían según el refugio y la mascota específica. Generalmente incluyen: ser mayor de edad, tener ingresos estables, vivir en una vivienda apropiada, y mostrar compromiso a largo plazo. Cada refugio puede tener requisitos adicionales como experiencia previa con mascotas o características específicas del hogar."
    },
    {
      category: 'adoption',
      question: "¿Cuánto tiempo tarda el proceso de adopción?",
      answer: "El tiempo varía entre 1-4 semanas dependiendo del refugio y la mascota. Incluye el tiempo de revisión de tu solicitud, entrevista, verificación de referencias, y período de adaptación. Algunas adopciones pueden ser más rápidas si hay una buena compatibilidad inicial."
    },
    {
      category: 'adoption',
      question: "¿Hay algún costo por usar la plataforma?",
      answer: "No, nuestra plataforma es completamente gratuita para los usuarios. Sin embargo, los refugios pueden tener sus propias tarifas de adopción para cubrir gastos veterinarios, vacunación, esterilización y cuidado general de la mascota."
    },
    {
      category: 'adoption',
      question: "¿Las mascotas están vacunadas y esterilizadas?",
      answer: "La mayoría de las mascotas en nuestra plataforma están vacunadas y esterilizadas. Cada perfil de mascota incluye información detallada sobre su estado de salud. Los refugios se aseguran de que las mascotas estén en óptimas condiciones antes de ponerlas en adopción."
    },
    {
      category: 'adoption',
      question: "¿Qué pasa si la adopción no funciona?",
      answer: "Entendemos que a veces las circunstancias cambian. La mayoría de refugios tienen políticas de devolución y te ayudarán a encontrar una nueva familia para la mascota. Es importante comunicarse con el refugio lo antes posible si surgen problemas."
    },

    // Platform Usage
    {
      category: 'platform',
      question: "¿Cómo creo mi perfil de adoptante?",
      answer: "Durante el registro, completarás un cuestionario sobre tu estilo de vida, vivienda, experiencia con mascotas y preferencias. Esta información nos ayuda a conectarte con mascotas compatibles. Puedes actualizar tu perfil en cualquier momento desde la configuración de tu cuenta."
    },
    {
      category: 'platform',
      question: "¿Cómo funciona el sistema de compatibilidad?",
      answer: "Nuestro algoritmo analiza tu perfil de adoptante (tipo de vivienda, estilo de vida, preferencias) y lo compara con las características y necesidades de cada mascota. Te mostramos mascotas que tienen mayor probabilidad de ser una buena pareja para tu situación específica."
    },
    {
      category: 'platform',
      question: "¿Puedo cambiar mis preferencias después del registro?",
      answer: "Sí, puedes actualizar tu perfil y preferencias en cualquier momento desde la sección 'Configuración' de tu cuenta. Los cambios se aplicarán inmediatamente y afectarán las recomendaciones futuras de mascotas."
    },
    {
      category: 'platform',
      question: "¿Cómo guardo mascotas para ver más tarde?",
      answer: "Puedes marcar mascotas como favoritas haciendo clic en el icono de corazón. Todas tus mascotas favoritas se guardan en tu perfil y puedes acceder a ellas desde el menú principal."
    },
    {
      category: 'platform',
      question: "¿Puedo contactar directamente con el refugio?",
      answer: "Una vez que envías una solicitud de adopción, el refugio puede contactarte directamente. No proporcionamos información de contacto directa inicialmente para proteger la privacidad de ambas partes y asegurar que el proceso siga los protocolos apropiados."
    },

    // For Shelters
    {
      category: 'shelters',
      question: "¿Cómo puede mi refugio unirse a NewTail?",
      answer: "Los refugios y protectoras pueden solicitar acceso completando nuestro formulario de registro empresarial. Nuestro equipo revisará la solicitud y proporcionará acceso al panel de gestión donde podrán agregar sus mascotas y gestionar adopciones."
    },
    {
      category: 'shelters',
      question: "¿Qué beneficios ofrece NewTail a los refugios?",
      answer: "NewTail ofrece mayor visibilidad para las mascotas, adoptantes pre-filtrados según compatibilidad, gestión centralizada de solicitudes, y un sistema automatizado que reduce el trabajo manual de coordinación y seguimiento."
    },
    {
      category: 'shelters',
      question: "¿Hay algún costo para los refugios?",
      answer: "NewTail es gratuito para refugios y organizaciones sin ánimo de lucro. Nuestro objetivo es facilitar las adopciones y apoyar el trabajo vital que realizan estas organizaciones."
    },
    {
      category: 'shelters',
      question: "¿Cómo gestionamos las solicitudes de adopción?",
      answer: "Los refugios tienen acceso a un panel de gestión donde pueden ver todas las solicitudes, revisar perfiles de adoptantes, aceptar o rechazar solicitudes, y comunicarse con los adoptantes potenciales. El sistema organiza todo de manera eficiente."
    },

    // Account & Profile
    {
      category: 'account',
      question: "¿Cómo cambio mi contraseña?",
      answer: "Puedes cambiar tu contraseña desde la sección 'Configuración' de tu cuenta. También puedes usar la opción 'Olvidé mi contraseña' en la página de inicio de sesión si necesitas restablecerla."
    },
    {
      category: 'account',
      question: "¿Puedo eliminar mi cuenta?",
      answer: "Sí, puedes eliminar tu cuenta desde la configuración. Ten en cuenta que esto eliminará permanentemente todos tus datos, favoritos y solicitudes pendientes. Si tienes una adopción en proceso, te recomendamos coordinar con el refugio antes de eliminar tu cuenta."
    },
    {
      category: 'account',
      question: "¿Cómo actualizo mi información de contacto?",
      answer: "Puedes actualizar tu email, teléfono y otra información de contacto desde tu perfil en la sección 'Configuración'. Es importante mantener esta información actualizada para que los refugios puedan contactarte."
    },

    // Safety & Security
    {
      category: 'safety',
      question: "¿Cómo protegen mi información personal?",
      answer: "Tomamos la privacidad muy en serio. Tu información personal está protegida con cifrado y solo se comparte con refugios cuando envías una solicitud de adopción. Nunca vendemos o compartimos tu información con terceros."
    },
    {
      category: 'safety',
      question: "¿Cómo verifican a los refugios?",
      answer: "Todos los refugios y organizaciones pasan por un proceso de verificación antes de unirse a nuestra plataforma. Revisamos su documentación legal, referencias y legitimidad para asegurar la seguridad de las mascotas y adoptantes."
    },
    {
      category: 'safety',
      question: "¿Qué hago si encuentro contenido inapropiado?",
      answer: "Si encuentras contenido que viola nuestras políticas, puedes reportarlo contactando con nuestro equipo de soporte. Investigamos todos los reportes y tomamos las medidas apropiadas para mantener la plataforma segura."
    },

    // General Help
    {
      category: 'platform',
      question: "¿Cómo puedo ayudar si no puedo adoptar?",
      answer: "Hay muchas maneras de ayudar: donar a refugios locales, compartir publicaciones de mascotas en redes sociales, ser voluntario en eventos de adopción, o considerar el acogimiento temporal de mascotas que necesitan cuidados especiales."
    }
  ];

  // Helper function to normalize text (remove accents and convert to lowercase)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD') // Decompose combined characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .trim();
  };

  // Filter FAQ based on search and category
  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      normalizeText(item.question).includes(normalizeText(searchTerm)) ||
      normalizeText(item.answer).includes(normalizeText(searchTerm));
    
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Simplified docking logic - use viewport coordinates for precision
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Make docking trigger very early - at just 10% of hero section
      const heroSectionHeight = windowHeight * 0.7; // 70vh
      const dockThreshold = heroSectionHeight * 0.1; // Dock very early - at 10% of hero height
      
      const shouldDock = scrollY > dockThreshold;
      
      if (shouldDock !== isSearchDocked) {
        setIsSearchDocked(shouldDock);
        
        // Update header expansion state
        if (window.setHeaderSearchDocked) {
          window.setHeaderSearchDocked(shouldDock);
        }
        
        if (shouldDock) {
          // Use fixed viewport coordinates - responsive positioning
          const getTargetPosition = () => {
            const width = window.innerWidth;
            
            // Mobile (< 640px): Position closer to top
            if (width < 640) {
              return 80; // 70px from top of viewport
            }
            // Tablet (640px - 1024px): Slightly lower
            else if (width < 1024) {
              return 80; // 80px from top of viewport  
            }
            // Desktop (>= 1024px): Standard position
            else {
              return 90; // 90px from top of viewport
            }
          };
          
          const targetY = getTargetPosition();
          
          // Calculate movement using viewport-based positioning instead of DOM position
          // The search input is always positioned at 50% of viewport height initially
          const expectedInitialCenterY = windowHeight * 0.5; // 50% of viewport height
          const moveDistance = targetY - expectedInitialCenterY;
          
          searchY.set(moveDistance);
        } else {
          // Return to original position
          searchY.set(0);
        }
      }
    };

    // Initial positioning - run immediately without waiting for animation
    const runInitialPositioning = () => {
      // Force an immediate scroll check to set proper initial state
      handleScroll();
      
      // Also run after a short delay to catch any missed positioning
      setTimeout(handleScroll, 50);
    };

    // Throttled scroll handler
    let rafId;
    const throttledScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', throttledScroll, { passive: true });
    
    // Run initial positioning immediately
    runInitialPositioning();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', throttledScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isSearchDocked, searchY]); // Remove dependency on animation delay

  // Simplified re-check for content changes - make it more reliable and animation-independent
  useEffect(() => {
    // Immediate positioning check
    const triggerPositionCheck = () => {
      const event = new Event('scroll');
      window.dispatchEvent(event);
    };

    // Run immediately and with minimal delays
    triggerPositionCheck();
    const timer = setTimeout(triggerPositionCheck, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [filteredFAQ.length, activeCategory, searchTerm]);

  // Contact form handlers
  const handleContactInputChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateContactForm = () => {
    const errors = {};
    
    const emailValidation = validateEmail(contactForm.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
    
    const messageValidation = validateTextField(contactForm.message, true);
    if (!messageValidation.isValid) {
      errors.message = messageValidation.message;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateContactForm()) {
      setSubmissionTrigger(prev => prev + 1);
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    
    try {
      // Validate and clean the message field to remove line breaks
      const messageValidation = validateTextField(contactForm.message, true);
      const cleanMessage = messageValidation.cleanText;
      
      // Build request body matching the GeneralInquiry model
      const requestBody = {
        email: contactForm.email.trim(),
        mensaje: cleanMessage // Use cleaned message without line breaks
      };
      
      // Make actual API call to /api/consulta-general/ endpoint
      await contactApi.submitGeneralInquiry(requestBody);
      
      setShowSuccessModal(true);
      setContactForm({ email: '', message: '' });
      
    } catch (error) {
      console.error('General inquiry submission error:', error);
      if (error.response?.status === 400) {
        // Handle validation errors from backend
        showError('Error en los datos del formulario. Verifica la información.');
      } else {
        showError('Error al enviar la consulta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomePageLayout>
      <div className="min-h-screen flex flex-col hide-scrollbar overflow-x-hidden">
        
        {/* Hero Section */}
        <section className="min-h-[70vh] bg-gradient-to-br from-marine-400 via-oxford-500 to-marine-400 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-aquamarine-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-20 w-48 h-48 bg-orchid-500 rounded-full blur-3xl"></div>
          </div>

          <motion.div 
            className="max-w-4xl mx-auto px-4 py-20 relative z-10 text-center"
            style={{ opacity: heroOpacity, y: heroY }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-aquamarine-400 mb-8">
                <HelpCircle size={20} />
                <span className="text-sm np-medium">Centro de ayuda</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl text-white np-bold leading-tight mb-6">
                ¿Cómo podemos
                <br />
                <span className="text-aquamarine-400">ayudarte?</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 np-light max-w-2xl mx-auto mb-12">
                Encuentra respuestas a las preguntas más frecuentes sobre adopción de mascotas y el uso de nuestra plataforma
              </p>

              {/* Placeholder for search bar position */}
              <div className="max-w-lg mx-auto h-16"></div>
            </motion.div>
          </motion.div>
        </section>

        {/* Sticky Search Bar - fixed motion wrapper */}
        <motion.div
          ref={searchRef}
          style={{
            y: animatedY,
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: isSearchDocked ? 55 : 1100,
            width: 'calc(100% - 2rem)',
            maxWidth: '28rem',
            pointerEvents: 'auto',
            willChange: 'transform'
          }}
          className="-translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar en preguntas frecuentes..."
              leftIcon={<Search size={18} />}
              className={isSearchDocked ? 'shadow-md' : 'shadow-2xl'}
            />
          </motion.div>
        </motion.div>

        {/* FAQ Categories */}
        <section ref={faqSectionRef} className="py-12 bg-oxford-50 relative z-10">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 np-medium text-sm cursor-pointer ${
                      activeCategory === category.id
                        ? 'bg-orchid-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-orchid-50 hover:text-orchid-600 border border-gray-200'
                    }`}
                  >
                    <category.icon size={16} />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">
                      {category.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </AnimatedSection>

            {/* Results Counter */}
            <AnimatedSection delay={0.1}>
              <div className="text-center mb-8">
                <p className="text-gray-600 np-regular">
                  {filteredFAQ.length} pregunta{filteredFAQ.length !== 1 ? 's' : ''} encontrada{filteredFAQ.length !== 1 ? 's' : ''}
                  {searchTerm && ` para "${searchTerm}"`}
                  {activeCategory !== 'all' && ` en ${faqCategories.find(c => c.id === activeCategory)?.label.toLowerCase()}`}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={accordionSectionRef} className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedSection delay={0.2}>
              <div>
                {filteredFAQ.length > 0 ? (
                  <Accordion 
                    items={filteredFAQ.map(item => ({
                      question: item.question,
                      answer: item.answer
                    }))}
                  />
                ) : (
                  <div className="text-center py-16">
                    <HelpCircle size={64} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl np-bold text-gray-900 mb-2">
                      No se encontraron resultados
                    </h3>
                    <p className="text-gray-600 np-regular mb-6">
                      Intenta con otros términos de búsqueda o selecciona una categoría diferente
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setActiveCategory('all');
                      }}
                      variant="ghost-marine"
                    >
                      Ver todas las preguntas
                    </Button>
                  </div>
                )}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Contact Form Section */}
        <section ref={contactSectionRef} className="py-20 bg-oxford-50" id="contact">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-marine-100 text-marine-700 px-4 py-2 rounded-full mb-6">
                  <MessageCircle size={18} />
                  <span className="text-sm np-medium">¿No encuentras lo que buscas?</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  Contáctanos <span className="text-orchid-500">directamente</span>
                </h2>
                <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto">
                  Nuestro equipo está aquí para ayudarte. Envíanos tu consulta y te responderemos en las próximas 24 horas.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <InputField
                    label="Tu email"
                    type="email"
                    value={contactForm.email}
                    onChange={(value) => handleContactInputChange('email', value)}
                    placeholder="tu@email.com"
                    leftIcon={<Mail size={18} />}
                    error={!!validationErrors.email}
                    errorMessage={validationErrors.email}
                    submissionTrigger={submissionTrigger}
                    required
                  />

                  <TextField
                    id="contact-message"
                    label="Tu consulta"
                    value={contactForm.message}
                    onChange={(value) => handleContactInputChange('message', value)}
                    placeholder="Describe tu consulta o problema. Incluye todos los detalles que consideres relevantes..."
                    rows={6}
                    error={!!validationErrors.message}
                    errorMessage={validationErrors.message}
                    submissionTrigger={submissionTrigger}
                    validateInput={true}
                    required
                  />

                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      className={`np-bold transition-all duration-200 ${
                        loading 
                          ? 'opacity-90 cursor-not-allowed' 
                          : 'hover:scale-105 active:scale-95'
                      }`}
                      rightIcon={loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-white" />
                      ) : (
                        <Send size={20} />
                      )}
                    >
                      {loading ? 'Enviando...' : 'Enviar consulta'}
                    </Button>
                  </div>
                </form>
              </div>
            </AnimatedSection>

            {/* Alternative Contact Methods */}
            <AnimatedSection delay={0.3}>
              <div className="mt-12 text-center">
                <h3 className="text-lg np-bold text-gray-900 mb-6">Otras formas de contactar</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Mail,
                      title: 'Email directo',
                      description: 'newtailsoporte@gmail.com',
                      action: 'mailto:newtailsoporte@gmail.com'
                    },
                    {
                      icon: Phone,
                      title: 'Teléfono de soporte',
                      description: '900 123 456',
                      action: 'tel:900123456'
                    }
                  ].map((contact, index) => (
                    <a
                      key={index}
                      href={contact.action}
                      className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-orchid-300 hover:shadow-lg transition-all duration-200 group"
                    >
                      <contact.icon size={32} className="text-orchid-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="text-lg np-bold text-gray-900 mb-2">{contact.title}</h4>
                      <p className="text-gray-600 np-regular">{contact.description}</p>
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-marine-800 text-white text-center">
          <AnimatedSection>
            <PawPrint size={48} className="text-aquamarine-400 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl np-bold mb-4">
              ¿Listo para adoptar?
            </h3>
            <p className="text-gray-300 np-regular mb-6 max-w-xl mx-auto">
              Si ya tienes todas las respuestas que necesitas, es hora de encontrar a tu compañero perfecto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="np-medium"
                  rightIcon={<Heart size={20} />}
                >
                  Comenzar adopción
                </Button>
              </Link>
              <Link to="/shelter">
                <Button
                  variant="outline"
                  size="lg"
                  className="np-medium"
                  leftIcon={<Building size={20} />}
                >
                  Soy un refugio
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
