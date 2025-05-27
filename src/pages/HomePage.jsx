import { useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import HomePageLayout from '../layouts/HomePageLayout';
import { LogIn, UserPlus, ArrowRight, Check, PawPrint, Heart, Home, Shield } from 'lucide-react';

// Animation component for sections
function AnimatedSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, delay: delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  // Parallax effect for hero section
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  
  return (
    <HomePageLayout>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section with parallax effect */}
        <motion.section 
          className="h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-marine-800/60 to-oxford-900/80 -z-10"></div>
          <div className="absolute inset-0 bg-[url('/images/hero-pets.jpg')] bg-cover bg-center opacity-20 -z-20"></div>
          
          <motion.div 
            className="max-w-3xl mx-auto"
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
                className="bg-aquamarine-400 hover:bg-aquamarine-500 text-oxford-900 py-4 px-8 rounded-full flex items-center justify-center gap-2 np-medium shadow-lg shadow-aquamarine-400/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/register" className="flex items-center justify-center gap-2 text-lg">
                  <UserPlus size={22} />
                  Adopta ahora
                </Link>
              </motion.div>
              <motion.div
                className="bg-transparent border-2 border-white hover:border-aquamarine-400 hover:text-aquamarine-400 text-white py-4 px-8 rounded-full flex items-center justify-center gap-2 np-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/login" className="flex items-center justify-center gap-2 text-lg">
                  <LogIn size={22} />
                  Iniciar Sesión
                </Link>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <motion.div 
              className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <motion.div 
                className="w-1.5 h-1.5 bg-white/80 rounded-full mt-2"
                animate={{ y: [0, 16, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.section>
        
        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-4 text-center">
                Cómo <span className="text-orchid-600">funciona</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-16">
                Un proceso simple diseñado para unir a mascotas con sus familias perfectas
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-20">
              {[
                { 
                  title: "Explora", 
                  description: "Navega entre cientos de mascotas esperando un hogar cerca de ti. Filtra según tus preferencias y estilo de vida.",
                  icon: <Home className="text-aquamarine-400" size={32} />,
                  delay: 0.1
                },
                { 
                  title: "Conéctate", 
                  description: "Encuentra a tu compañero ideal basado en tu personalidad, espacio disponible y preferencias.",
                  icon: <Heart className="text-aquamarine-400" size={32} />,
                  delay: 0.2
                },
                { 
                  title: "Adopta", 
                  description: "Completa un proceso sencillo y dale un hogar amoroso a quien te está esperando.",
                  icon: <PawPrint className="text-aquamarine-400" size={32} />,
                  delay: 0.3
                }
              ].map((step, index) => (
                <AnimatedSection key={index} delay={step.delay}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-oxford-50 flex items-center justify-center mb-5">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl text-oxford-800 np-medium mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Pets Section */}
        <section className="py-20 bg-oxford-50">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                <div>
                  <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-3">
                    Mascotas <span className="text-orchid-600">destacadas</span>
                  </h2>
                  <p className="text-lg text-gray-600 max-w-xl">
                    Estas adorables mascotas están esperando encontrar un hogar permanente lleno de amor
                  </p>
                </div>
                <Link to="/register" className="mt-6 md:mt-0 flex items-center gap-1 text-aquamarine-500 np-medium hover:text-aquamarine-600 transition-colors">
                  Ver todas las mascotas
                  <ArrowRight size={18} />
                </Link>
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Luna",
                  species: "Gato",
                  age: "2 años",
                  image: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&w=600&q=80"
                },
                {
                  name: "Rocky",
                  species: "Perro",
                  age: "3 años",
                  image: "https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&w=600&q=80"
                },
                {
                  name: "Simba",
                  species: "Gato",
                  age: "1 año",
                  image: "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&w=600&q=80"
                }
               ].map((pet, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow">
                    <div className="h-56 overflow-hidden">
                      <img 
                        src={pet.image} 
                        alt={pet.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl np-semibold text-oxford-800">{pet.name}</h3>
                      <p className="text-gray-500">{pet.species}, {pet.age}</p>
                      <div className="mt-4">
                        <Link to="/register" className="flex items-center gap-2 text-aquamarine-500 hover:text-aquamarine-600 np-medium">
                          <span>Conocer más</span>
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
        
        {/* About Us Section */}
        <section className="py-20 bg-white">
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
                    <p className="text-oxford-800 np-medium">Adopciones exitosas</p>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={0.2}>
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  Sobre <span className="text-orchid-600">Nosotros</span>
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Somos una plataforma dedicada a conectar mascotas que necesitan un hogar con familias que buscan 
                  un nuevo miembro. Nuestra misión es facilitar el proceso de adopción y asegurar que cada mascota 
                  encuentre un hogar donde será amada y cuidada.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  Fundada en 2023, nuestra plataforma ha ayudado a más de 500 mascotas a encontrar un hogar permanente. 
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
                      <div className="p-1 rounded-full bg-aquamarine-100 text-aquamarine-600">
                        <Check size={16} />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-oxford-50">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-4 text-center">
                Preguntas <span className="text-orchid-600">Frecuentes</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
                Respuestas a las dudas más comunes sobre nuestro proceso de adopción
              </p>
            </AnimatedSection>
            
            <div className="space-y-6">
              {[
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
                  answer: "Hay muchas maneras de ayudar: puedes convertirte en hogar temporal, donar a refugios locales, compartir publicaciones de mascotas en redes sociales o ser voluntario en eventos de adopción."
                },
                {
                  question: "¿Las mascotas están vacunadas y esterilizadas?",
                  answer: "La mayoría de las mascotas en nuestra plataforma están vacunadas y esterilizadas. Cada perfil de mascota incluye información detallada sobre su estado de salud. Los refugios se aseguran de que las mascotas estén en óptimas condiciones antes de ponerlas en adopción."
                }
            ].map((faq, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-xl np-medium text-oxford-800 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-marine-800 text-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <AnimatedSection>
              <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-marine-700 text-aquamarine-400 mb-6">
                <Shield size={20} className="mr-2" /> 
                <span className="text-sm np-medium">Proceso 100% seguro y verificado</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl np-bold mb-6">
                Cambia una vida hoy. <span className="text-aquamarine-400">Adopta.</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                Miles de mascotas están esperando encontrar un hogar lleno de amor y cuidado. Sé parte del cambio y encuentra a tu compañero perfecto.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/register" 
                    className="bg-aquamarine-400 hover:bg-aquamarine-500 text-oxford-900 py-4 px-8 rounded-full flex items-center justify-center gap-2 np-medium shadow-lg shadow-aquamarine-400/20 text-lg w-full sm:w-auto"
                  >
                    <UserPlus size={22} />
                    Comenzar ahora
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/login" 
                    className="bg-transparent border-2 border-white hover:border-aquamarine-400 hover:text-aquamarine-400 text-white py-4 px-8 rounded-full flex items-center justify-center gap-2 np-medium transition-colors text-lg w-full sm:w-auto"
                  >
                    <LogIn size={22} />
                    Iniciar Sesión
                  </Link>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </HomePageLayout>
  );
}
