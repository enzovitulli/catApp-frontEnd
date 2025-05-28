import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import HomePageLayout from '../layouts/HomePageLayout';
import { LogIn, UserPlus, ArrowRight, Check, PawPrint, Heart, Home, Shield, Building, ExternalLink } from 'lucide-react';
import Button from '../components/Button';
import Accordion from '../components/Accordion';

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

export default function HomePage() {
  // Parallax effect for hero section - adjusted input range for smoother transition
  const { scrollYProgress } = useScroll();
  // Adjust the fade-out to finish earlier in the scroll (from 0.15 to 0)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  // Reduce the movement amount to prevent overlap
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 50]);
  
  return (
    <HomePageLayout>
      <div className="min-h-screen flex flex-col hide-scrollbar overflow-x-hidden">
        {/* Hero Section Container with proper z-index */}
        <div className="relative h-screen z-0 overflow-hidden">
          {/* Hero Section with parallax effect */}
          <motion.section 
            className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
            style={{ opacity: heroOpacity, y: heroY }}
          >
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-marine-800/60 to-oxford-900/80 -z-10"></div>
            <div className="absolute inset-0 bg-[url('/images/hero-pets.jpg')] bg-cover bg-center opacity-20 -z-20"></div>
            
            <motion.div 
              className="max-w-3xl mx-auto relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-7xl text-white np-bold mb-6">
                Encuentra a tu <span className="text-aquamarine-400">compañero perfecto</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 np-light mb-12 max-w-2xl mx-auto">
                Conectamos mascotas que necesitan un hogar con familias que buscan amor incondicional
              </p>
              
              <div className="flex flex-col md:flex-row gap-5 justify-center mt-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    to="/register" 
                    variant="secondary"
                    size="lg"
                    className="np-bold"
                    leftIcon={<UserPlus size={22} />}
                  >
                    Adopta ahora
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    to="/login" 
                    variant="outline"
                    size="lg"
                    leftIcon={<LogIn size={22} />}
                  >
                    Iniciar Sesión
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.section>
        </div>
        
        {/* How It Works Section - with higher z-index */}
        <section className="py-20 bg-white relative z-10" id="how-it-works">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-4 text-center">
                Cómo <span className="text-orchid-600">funciona</span>
              </h2>
              <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto text-center mb-16">
                Un proceso simple diseñado para unir a mascotas con sus familias perfectas
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-20">
              {[
                { 
                  title: "Regístrate", 
                  description: "Crea tu cuenta fácilmente y selecciona tus preferencias para encontrar mascotas compatibles con tu estilo de vida.",
                  icon: <Home className="text-aquamarine-400" size={32} />,
                  delay: 0.1
                },
                { 
                  title: "Descubre", 
                  description: "Explora mascotas cercanas a ti que buscan un hogar y se adapten a tus preferencias específicas.",
                  icon: <Heart className="text-orchid-500" size={32} />,
                  delay: 0.2
                },
                { 
                  title: "Adopta", 
                  description: "Envía una solicitud para que el centro revise tu perfil y se ponga en contacto directamente contigo.",
                  icon: <PawPrint className="text-aquamarine-400" size={32} />,
                  delay: 0.3
                }
              ].map((step, index) => (
                <AnimatedSection key={index} delay={step.delay}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-oxford-800 flex items-center justify-center mb-5">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl text-oxford-800 np-semibold mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 np-regular">{step.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Pets Section - updated to Rescue Stories */}
        <section className="py-20 bg-oxford-50" id="featured">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                <div>
                  <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-3">
                    Mascotas <span className="text-orchid-600">rescatadas</span>
                  </h2>
                  <p className="text-lg text-gray-600 np-regular max-w-xl">
                    Conoce algunas de nuestras historias de rescate más inspiradoras
                  </p>
                </div>
                <Button
                  to="/historias"
                  variant="ghost-marine"
                  className="np-semibold mt-6 md:mt-0"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Más historias
                </Button>
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Luna",
                  image: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&w=600&q=80",
                  story: "Encontrada abandonada bajo la lluvia, ahora Luna ilumina el hogar de quien la adopte."
                },
                {
                  name: "Rocky",
                  image: "https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&w=600&q=80",
                  story: "Tras ser rescatado de una situación de maltrato, Rocky ha vuelto a confiar en los humanos."
                },
                {
                  name: "Simba",
                  image: "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&w=600&q=80",
                  story: "Nació en la calle y fue rescatado junto a sus hermanos. Junto a su nueva familia, ahora vive feliz y seguro."
                }
               ].map((pet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  className="h-full"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow h-full flex flex-col">
                    <div className="h-52 overflow-hidden">
                      <img 
                        src={pet.image} 
                        alt={pet.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col flex-1 p-4 pb-12 relative">
                      <div className="flex-grow">
                        <h3 className="text-xl np-semibold text-oxford-900 mb-2">{pet.name}</h3>
                        <p className="text-gray-600 np-regular line-clamp-3">{pet.story}</p>
                      </div>
                      <div className="absolute bottom-4 left-4 pt-2">
                        <Button
                          to={`/historias/${pet.name.toLowerCase()}`}
                          variant="ghost-marine"
                          size="sm"
                          className="np-semibold pl-0"
                          rightIcon={<ArrowRight size={16} />}
                        >
                          Conoce su historia
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* About Us Section */}
        <section className="py-20 bg-white" id="about">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <div className="relative">
                  <div className="rounded-xl overflow-hidden shadow-xl shadow-gray-200/60">
                    <img 
                      src="/images/about-team.jpg" 
                      alt="Our team" 
                      className="w-full h-auto"
                      onError={(e) => {
                        e.target.src = "https://images.pexels.com/photos/7788657/pexels-photo-7788657.jpeg";
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-5 -right-5 bg-aquamarine-400 rounded-lg p-6 shadow-lg">
                    <p className="text-2xl np-bold text-oxford-900">+500</p>
                    <p className="text-oxford-900 np-medium">Adopciones exitosas</p>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={0.2}>
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  Sobre <span className="text-orchid-600">Nosotros</span>
                </h2>
                <p className="text-lg text-gray-600 np-regular mb-4">
                  Somos una plataforma dedicada a conectar mascotas que necesitan un hogar con familias que buscan 
                  un nuevo miembro. Nuestra misión es facilitar el proceso de adopción y asegurar que cada mascota 
                  encuentre un hogar donde será amada y cuidada.
                </p>
                <p className="text-lg text-gray-600 np-regular mb-8">
                  Fundada en 2025, nuestra plataforma ha ayudado a más de 500 mascotas a encontrar un hogar permanente. 
                  Trabajamos con refugios y organizaciones de rescate en todo el país para garantizar que las mascotas 
                  reciban la atención que merecen.
                </p>
                
                <ul className="space-y-3">
                  {[
                    "Veterinarios y especialistas en comportamiento animal",
                    "Proceso de adopción seguro y verificado",
                    "Seguimiento y apoyo posterior a la adopción"
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
        
        {/* Adoption Centers CTA Section */}
        <section className="py-20 bg-oxford-50" id="adoption-centers">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection delay={0.2}>
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  ¿Eres un <span className="text-aquamarine-500">refugio o centro</span> de adopción?
                </h2>
                <p className="text-lg text-gray-600 np-regular mb-6">
                  NewTail ofrece a refugios y protectoras una plataforma para conectar 
                  con adoptantes compatibles con los requisitos de tus mascotas.
                </p>
                <p className="text-lg text-gray-600 np-regular mb-8">
                  Aumenta la visibilidad de tus mascotas y alcanza a un público más amplio en tu provincia, 
                  acelerando el proceso de adopción y encontrando los hogares adecuados más rápidamente.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Registro sencillo para organizaciones",
                    "Alcance a adoptantes locales cercanos a ti",
                    "Filtro automático por compatibilidad con los requisitos",
                    "Gestión centralizada de solicitudes de adopción"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-aquamarine-400 text-oxford-900">
                        <Check size={16} className="np-bold" />
                      </div>
                      <span className="text-gray-700 np-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex justify-center md:justify-start"
                >
                  <Button 
                    to="/register/shelter"
                    variant="marine" 
                    size="lg"
                    leftIcon={<Building size={20} />}
                    className="np-semibold"
                  >
                    Unirme como refugio
                  </Button>
                </motion.div>
              </AnimatedSection>

              <AnimatedSection>
                <div className="relative rounded-xl overflow-hidden shadow-xl shadow-gray-200/40">
                  <img 
                    src="/images/shelter-workers.jpg" 
                    alt="Centro de adopción" 
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.src = "https://images.pexels.com/photos/1350591/pexels-photo-1350591.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-oxford-900/70 to-transparent flex items-end">
                    <div className="p-6">
                      <p className="text-white text-lg np-medium">Más de 60 protectoras confían ya en nosotros</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-white" id="faq">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-4 text-center">
                Preguntas <span className="text-orchid-600">Frecuentes</span>
              </h2>
              <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto text-center mb-12">
                Respuestas a las dudas más comunes sobre nuestro proceso de adopción
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <Accordion 
                items={[
                  {
                    question: "¿Cómo funciona el proceso de adopción?",
                    answer: "El proceso comienza creando una cuenta en nuestra plataforma. Luego, puedes explorar las mascotas disponibles, filtrarlas según tus preferencias y enviar una solicitud para la mascota que te interese. El refugio o organización revisará tu solicitud y se pondrá en contacto contigo para continuar con el proceso."
                  },
                  {
                    question: "¿Hay algún costo por usar la plataforma?",
                    answer: "No, nuestra plataforma es completamente gratuita para los usuarios. Sin embargo, los refugios pueden tener sus propias tarifas de adopción para cubrir gastos veterinarios y de cuidado."
                  },
                  {
                    question: "¿Cómo puedo ayudar si no puedo adoptar?",
                    answer: "Hay muchas maneras de ayudar: donar a refugios locales, compartir publicaciones de mascotas en redes sociales o ser voluntario en eventos de adopción."
                  },
                  {
                    question: "¿Las mascotas están vacunadas y esterilizadas?",
                    answer: "La mayoría de las mascotas en nuestra plataforma están vacunadas y esterilizadas. Cada perfil de mascota incluye información detallada sobre su estado de salud. Los refugios se aseguran de que las mascotas estén en óptimas condiciones antes de ponerlas en adopción."
                  }
                ]}
              />

              <div className="mt-8 text-center">
                <Link to="/help" className="inline-flex items-center text-marine-700 hover:text-marine-600 np-medium">
                  <span>Más preguntas frecuentes</span>
                  <ExternalLink size={16} className="ml-1" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-marine-800 text-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <AnimatedSection>
              <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-orchid-600 text-white mb-6">
                <Shield size={20} className="mr-2" /> 
                <span className="text-sm np-medium">Proceso 100% seguro y verificado</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl np-bold mb-6">
                Cambia una vida hoy. <span className="text-orchid-400">Adopta.</span>
              </h2>
              <p className="text-lg text-gray-300 np-regular max-w-2xl mx-auto mb-10">
                Miles de mascotas están esperando encontrar un hogar lleno de amor y cuidado. Sé parte del cambio y encuentra a tu compañero perfecto.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    to="/register"
                    variant="secondary"
                    size="lg"
                    className="np-bold w-full sm:w-auto"
                    leftIcon={<UserPlus size={22} />}
                  >
                    Comenzar ahora
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    to="/login"
                    variant="outline"
                    size="lg" 
                    className="w-full sm:w-auto"
                    leftIcon={<LogIn size={22} />}
                  >
                    Iniciar Sesión
                  </Button>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </HomePageLayout>
  );
}
