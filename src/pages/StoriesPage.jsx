import { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import HomePageLayout from '../layouts/HomePageLayout';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Users, 
  Star,
  PawPrint,
  Home,
  Sparkles,
  Clock,
  Camera,
  Award,
  Shield
} from 'lucide-react';
import Button from '../components/Button';
import ImageModal from '../components/ImageModal';

// Improved animation component
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

// Story Card Component
function StoryCard({ story, index, isFeatureCard = false }) {
  const [showImageModal, setShowImageModal] = useState(false);
  
  const cardRef = useRef(null);
  
  return (
    <>
      <motion.div
        ref={cardRef}
        id={story.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: index * 0.2 }}
        className={`${
          isFeatureCard 
            ? 'lg:col-span-2 bg-gradient-to-br from-aquamarine-50 to-orchid-50 border-2 border-aquamarine-200' 
            : 'bg-white border border-gray-100'
        } rounded-2xl overflow-hidden shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 group`}
      >
        {/* Image Section */}
        <div className={`relative overflow-hidden ${isFeatureCard ? 'h-80 lg:h-96' : 'h-64'}`}>
          <motion.img
            src={story.images[0]}
            alt={story.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            whileHover={{ scale: 1.02 }}
          />
          
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* View Photos Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowImageModal(true)}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
          >
            <Camera size={20} className="text-gray-700" />
          </motion.button>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm np-medium shadow-lg">
              <Heart size={14} />
              <span>Adoptado</span>
            </div>
          </div>

          {/* Feature Badge */}
          {isFeatureCard && (
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2 bg-aquamarine-500 text-oxford-900 px-3 py-1 rounded-full text-sm np-bold shadow-lg">
                <Star size={14} />
                <span>Historia Destacada</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className={`p-6 ${isFeatureCard ? 'lg:p-8' : ''}`}>
          {/* Pet Info Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`np-bold text-oxford-900 mb-2 ${isFeatureCard ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                {story.name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{story.age}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{story.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{story.adoptionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="space-y-4">
            <p className={`text-gray-700 np-regular leading-relaxed ${isFeatureCard ? 'text-lg' : ''}`}>
              {story.beforeStory}
            </p>
            
            <div className={`p-4 bg-gradient-to-r from-aquamarine-50 to-transparent border-l-4 border-aquamarine-500 rounded-r-lg ${isFeatureCard ? 'p-6' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-aquamarine-600" />
                <span className="text-sm np-bold text-aquamarine-700">El momento del cambio</span>
              </div>
              <p className="text-gray-700 np-regular italic">
                {story.newTailMoment}
              </p>
            </div>

            <p className={`text-gray-700 np-regular leading-relaxed ${isFeatureCard ? 'text-lg' : ''}`}>
              {story.afterStory}
            </p>
          </div>

          {/* Family Info */}
          <div className={`mt-6 p-4 bg-gray-50 rounded-xl ${isFeatureCard ? 'p-6 mt-8' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-orchid-500" />
              <span className="np-bold text-gray-800">Su nueva familia</span>
            </div>
            <p className="text-gray-600 np-regular">{story.familyInfo}</p>
            
            {story.familyQuote && (
              <div className="mt-3 pl-4 border-l-2 border-orchid-200">
                <p className="text-orchid-700 np-medium italic">"{story.familyQuote}"</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={story.images}
        currentIndex={0}
        petName={story.name}
      />
    </>
  );
}

export default function StoriesPage() {
  const { id: storyId } = useParams();
  
  // Parallax effect - lighter than ShelterPage, darker than HelpPage
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 50]);

  // Stories data - expanding on HomePage pets plus new ones
  const stories = [
    // Original pets from HomePage - expanded stories
    {
      id: 'rocky',
      name: 'Rocky',
      age: '3 años',
      location: 'Madrid',
      adoptionDate: 'Marzo 2024',
      images: [
        'https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&w=600&q=80'
      ],
      beforeStory: 'Rocky llegó al refugio en condiciones terribles. Había sido víctima de maltrato y su cuerpo mostraba las cicatrices de una vida difícil. Sus ojos, que una vez brillaron con alegría, ahora reflejaban miedo y desconfianza hacia los humanos.',
      newTailMoment: 'Cuando María vio el perfil de Rocky en NewTail, algo en su mirada la conmovió profundamente. La plataforma había emparejado perfectamente su perfil de adoptante experimentada con perros que necesitan rehabilitación especial con las necesidades específicas de Rocky.',
      afterStory: 'Hoy, Rocky es un perro completamente diferente. Ha recuperado su confianza en los humanos y disfruta de largos paseos por el parque. María dice que Rocky no solo ha sanado físicamente, sino que ha llenado su hogar de amor incondicional.',
      familyInfo: 'María, veterinaria de 34 años, vive en un apartamento con terraza en Madrid. Tiene experiencia con perros de rescate.',
      familyQuote: 'Rocky me enseñó que el amor puede curar cualquier herida. Cada día me agradece con su mirada llena de cariño.',
      tags: ['Rescate', 'Rehabilitación', 'Segundo oportunidad', 'Madrid']
    },
    {
      id: 'luna',
      name: 'Luna',
      age: '2 años',
      location: 'Valencia',
      adoptionDate: 'Febrero 2024',
      images: [
        'https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&w=600&q=80'
      ],
      beforeStory: 'Luna fue encontrada durante una tormenta, empapada y temblando bajo un coche abandonado. Era solo una cachorra de pocos meses, completamente sola en el mundo. Los voluntarios del refugio la rescataron justo a tiempo.',
      newTailMoment: 'La familia Rodríguez había perdido recientemente a su perra y buscaban en NewTail una compañera que se adaptara bien a vivir con niños pequeños. El algoritmo de compatibilidad de la plataforma identificó a Luna como la candidata perfecta.',
      afterStory: 'Luna se convirtió en la hermana mayor que los niños siempre quisieron. Es protectora, cariñosa y ha demostrado una paciencia infinita con los más pequeños de la casa. Su transformación de cachorra asustada a guardiana amorosa ha sido extraordinaria.',
      familyInfo: 'Los Rodríguez, una familia de cinco con tres niños entre 4 y 12 años, viven en una casa con jardín en Valencia.',
      familyQuote: 'Luna llegó para quedarse en nuestros corazones. Los niños han aprendido responsabilidad y amor incondicional gracias a ella.',
      tags: ['Cachorra rescatada', 'Familia numerosa', 'Protectora', 'Valencia']
    },
    {
      id: 'simba',
      name: 'Simba',
      age: '4 años',
      location: 'Sevilla',
      adoptionDate: 'Enero 2024',
      images: [
        'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/1317844/pexels-photo-1317844.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg?auto=compress&w=600&q=80'
      ],
      beforeStory: 'Simba nació en las calles junto a sus cinco hermanos. La vida callejera era dura - hambre, frío y el peligro constante del tráfico. Cuando tenía seis meses, fue rescatado por una protectora local que se dedicaba a salvar animales sin hogar.',
      newTailMoment: 'Carlos, un jubilado que vivía solo, encontró en NewTail exactamente lo que buscaba: un compañero maduro y tranquilo. La plataforma había identificado que tanto Carlos como Simba necesitaban estabilidad y compañía mutua.',
      afterStory: 'La conexión entre Carlos y Simba fue instantánea. Ahora son inseparables - pasean juntos cada mañana, Simba acompaña a Carlos a hacer la compra, y por las tardes disfrutan juntos viendo televisión. Simba ha encontrado la estabilidad que nunca tuvo.',
      familyInfo: 'Carlos, jubilado de 68 años, vive en un piso tranquilo cerca del centro de Sevilla. Buscaba un compañero mayor y calmado.',
      familyQuote: 'Simba no es solo mi perro, es mi mejor amigo. Hemos encontrado en el otro la compañía perfecta para esta etapa de nuestras vidas.',
      tags: ['Perro senior', 'Compañía', 'Callejero rescatado', 'Sevilla']
    },

    // New stories
    {
      id: 'bella',
      name: 'Bella',
      age: '5 años',
      location: 'Barcelona',
      adoptionDate: 'Abril 2024',
      images: [
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/2023384/pexels-photo-2023384.jpeg?auto=compress&w=600&q=80'
      ],
      beforeStory: 'Bella había vivido toda su vida encadenada en un patio trasero. Cuando los servicios sociales la rescataron, había perdido gran parte de su pelaje por el estrés y apenas sabía caminar correctamente debido a la falta de ejercicio.',
      newTailMoment: 'Ana, fisioterapeuta especializada en rehabilitación, vio el perfil de Bella en NewTail y se sintió llamada a ayudar. La plataforma había identificado que Ana tenía experiencia en rehabilitación física, algo que Bella necesitaba desesperadamente.',
      afterStory: 'Con paciencia y cuidados especializados, Ana ayudó a Bella a recuperar su fuerza y confianza. Hoy Bella disfruta de caminatas largas, natación terapéutica y ha desarrollado una personalidad alegre y juguetona que nadie imaginaría dado su pasado.',
      familyInfo: 'Ana, fisioterapeuta de 29 años, vive en un apartamento moderno con acceso a parques y playa en Barcelona.',
      familyQuote: 'Ver a Bella correr libre por primera vez fue el momento más emotivo de mi vida. Cada paso de su recuperación ha sido un regalo.',
      tags: ['Rehabilitación física', 'Maltrato', 'Segunda oportunidad', 'Barcelona'],
      isFeature: true
    },
    {
      id: 'max',
      name: 'Max',
      age: '1 año',
      location: 'Bilbao',
      adoptionDate: 'Mayo 2024',
      images: [
        'https://images.pexels.com/photos/1629781/pexels-photo-1629781.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&w=600&q=80'
      ],
      beforeStory: 'Max nació con una malformación en una de sus patas traseras. Muchas familias lo rechazaron por su discapacidad, pensando que sería un burden. El refugio temía que nunca encontraría un hogar.',
      newTailMoment: 'Cuando Javier, un ingeniero que también tenía una discapacidad física, vio a Max en NewTail, supo inmediatamente que estaban destinados a estar juntos. La plataforma conectó dos almas que se entenderían profundamente.',
      afterStory: 'Max ha demostrado que las limitaciones físicas no definen el espíritu. Es un perro increíblemente enérgico y alegre que ha inspirado a Javier a ser más activo. Juntos practican deportes adaptados y han formado un equipo imparable.',
      familyInfo: 'Javier, ingeniero de 31 años, vive en Bilbao y practica deportes adaptados. Quería un compañero que entendiera los desafíos únicos.',
      familyQuote: 'Max me enseñó que las diferencias nos hacen especiales, no menos valiosos. Somos el equipo perfecto.',
      tags: ['Discapacidad', 'Inspiración', 'Deporte adaptado', 'Bilbao']
    },
    {
      id: 'coco',
      name: 'Coco',
      age: '6 años',
      location: 'Zaragoza',
      adoptionDate: 'Junio 2024',
      images: [
        'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/2061057/pexels-photo-2061057.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&w=600&q=80'
      ],
      beforeStory: 'Coco era una gata comunitaria que vivía en un barrio industrial. Había criado varias camadas en condiciones difíciles hasta que una operación de esterilización masiva la trajo al refugio. Era tímida y desconfiada después de años de supervivencia.',
      newTailMoment: 'Isabel, una maestra jubilada que había perdido a su gata de 18 años, buscaba en NewTail una compañera madura y tranquila. El sistema identificó que Coco sería perfecta para alguien que respetara su necesidad de espacio inicial.',
      afterStory: 'Coco floreció en el ambiente tranquilo de Isabel. Lentamente fue ganando confianza y ahora es una gata cariñosa que disfruta de las sesiones de lectura junto a su nueva mamá. Ha encontrado la paz que nunca conoció en la calle.',
      familyInfo: 'Isabel, maestra jubilada de 62 años, vive en un apartamento silencioso con mucha luz natural en Zaragoza.',
      familyQuote: 'Coco me ha enseñado la importancia de la paciencia. Su cariño se ganó día a día, y ahora es el más sincero que he conocido.',
      tags: ['Gata comunitaria', 'Tercera edad', 'Paciencia', 'Zaragoza']
    },
    {
      id: 'nala',
      name: 'Nala',
      age: '3 años',
      location: 'Málaga',
      adoptionDate: 'Julio 2024',
      images: [
        'https://images.pexels.com/photos/2558605/pexels-photo-2558605.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&w=600&q=80',
        'https://images.pexels.com/photos/1276518/pexels-photo-1276518.jpeg?auto=compress&w=600&q=80'
      ],
      beforeStory: 'Nala fue abandonada junto a la carretera cuando era una cachorra, con una herida grave en el ojo que requirió cirugía de emergencia. Aunque perdió la vista de un ojo, su espíritu nunca se quebró. Los veterinarios del refugio la cuidaron durante meses.',
      newTailMoment: 'David y Carmen, una pareja joven que buscaba su primera mascota, encontraron a Nala en NewTail. A pesar de su discapacidad visual, algo en su sonrisa canina los conquistó inmediatamente. La plataforma había identificado que eran la familia perfecta para una mascota especial.',
      afterStory: 'Nala ha demostrado que la discapacidad no limita la felicidad. Se ha adaptado perfectamente a su nuevo hogar y se ha convertido en la alegría de David y Carmen. Disfruta de los paseos por la playa, juega con otros perros y ha enseñado a sus nuevos padres sobre la resiliencia.',
      familyInfo: 'David y Carmen, ambos de 28 años, viven en un apartamento cerca de la playa en Málaga. Buscaban una mascota que los llenara de amor.',
      familyQuote: 'Nala nos enseñó que el amor verdadero no conoce limitaciones. Su alegría contagiosa ilumina cada día de nuestras vidas.',
      tags: ['Discapacidad visual', 'Primera mascota', 'Resiliencia', 'Málaga']
    }
  ];

  // Scroll to specific story on load
  useEffect(() => {
    if (storyId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(storyId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [storyId]);

  // Find feature story
  const featureStory = stories.find(story => story.isFeature);
  const regularStories = stories.filter(story => !story.isFeature);

  return (
    <HomePageLayout>
      <div className="min-h-screen flex flex-col hide-scrollbar overflow-x-hidden">
        
        {/* Hero Section - Between ShelterPage (darkest) and HelpPage (lightest) */}
        <section className="min-h-[70vh] bg-gradient-to-br from-oxford-700 via-marine-700 to-oxford-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-aquamarine-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-20 w-48 h-48 bg-orchid-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-aquamarine-400 rounded-full blur-2xl"></div>
          </div>

          <motion.div 
            className="max-w-4xl mx-auto px-4 py-20 relative z-10 text-center"
            style={{ opacity: heroOpacity, y: heroY }}
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-aquamarine-400 mb-8"
              >
                <Heart size={20} />
                <span className="text-sm np-medium">Historias de adopción</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl text-white np-bold leading-tight mb-6"
              >
                Cada adopción es una
                <br />
                <span className="text-aquamarine-400">historia</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-xl md:text-2xl text-gray-200 np-light max-w-2xl mx-auto mb-12"
              >
                Descubre cómo NewTail ha ayudado a conectar mascotas rescatadas con las familias perfectas, 
                creando vínculos que transforman vidas para siempre
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
              >
                {[
                  { number: '100+', label: 'Adopciones exitosas' },
                  { number: '95+', label: 'Familias satisfechas' },
                  { number: '60+', label: 'Refugios aliados' },
                  { number: '24h', label: 'Tiempo promedio de conexión' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl np-bold text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-aquamarine-200 np-regular">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Story Section */}
        {featureStory && (
          <section className="py-16 bg-gradient-to-br from-aquamarine-50 to-orchid-50">
            <div className="max-w-4xl mx-auto px-4">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-aquamarine-500 text-oxford-900 px-4 py-2 rounded-full mb-6">
                    <Award size={18} />
                    <span className="text-sm np-bold">Historia Destacada</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl text-oxford-900 np-bold mb-4">
                    Una transformación extraordinaria
                  </h2>
                  <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto">
                    Conoce la increíble historia de superación que demuestra el poder sanador del amor y la dedicación
                  </p>
                </div>
              </AnimatedSection>

              <StoryCard story={featureStory} index={0} isFeatureCard={true} />
            </div>
          </section>
        )}

        {/* Main Stories Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  Más historias de <span className="text-orchid-500">esperanza</span>
                </h2>
                <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto">
                  Cada mascota tiene una historia única, y cada adopción marca el comienzo de un nuevo capítulo lleno de amor y felicidad
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {regularStories.map((story, index) => (
                <StoryCard key={story.id} story={story} index={index + 1} />
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 bg-oxford-50">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl text-oxford-900 np-bold mb-6">
                  El impacto de <span className="text-aquamarine-500">NewTail</span>
                </h2>
                <p className="text-lg text-gray-600 np-regular max-w-2xl mx-auto">
                  Nuestra plataforma no solo conecta mascotas con familias, sino que transforma vidas y crea historias de amor duraderas
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Conexiones Seguras',
                  description: 'Verificamos tanto a refugios como adoptantes para asegurar el mejor hogar para cada mascota',
                  color: 'aquamarine'
                },
                {
                  icon: Heart,
                  title: 'Compatibilidad Perfecta',
                  description: 'Nuestro algoritmo inteligente une mascotas con familias basándose en estilo de vida y necesidades',
                  color: 'orchid'
                },
                {
                  icon: Sparkles,
                  title: 'Seguimiento Continuo',
                  description: 'Acompañamos el proceso de adaptación para asegurar que cada adopción sea exitosa',
                  color: 'aquamarine'
                }
              ].map((item, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <div className="text-center bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/40 border border-gray-100">
                    <div className={`w-16 h-16 rounded-xl mb-6 flex items-center justify-center mx-auto ${
                      item.color === 'aquamarine' ? 'bg-aquamarine-500' : 'bg-orchid-500'
                    }`}>
                      <item.icon size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl np-bold text-oxford-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 np-regular">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-oxford-900 text-white text-center">
          <AnimatedSection>
            <PawPrint size={48} className="text-aquamarine-400 mx-auto mb-4" />
            <h3 className="text-3xl md:text-5xl np-bold mb-6">
              ¿Preparado para escribir tu propia historia?
            </h3>
            <p className="text-lg text-gray-300 np-regular mb-10 max-w-2xl mx-auto">
              Miles de mascotas están esperando encontrar su familia perfecta. 
              Únete a NewTail y forma parte de la próxima historia de amor.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="np-medium w-full sm:w-auto"
                  rightIcon={<Heart size={20} />}
                >
                  Adoptar una mascota
                </Button>
              </Link>
              <Link to="/shelter">
                <Button
                  variant="outline"
                  size="lg"
                  className="np-medium w-full sm:w-auto"
                  leftIcon={<Home size={20} />}
                >
                  Soy un refugio
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </HomePageLayout>
  );
}
