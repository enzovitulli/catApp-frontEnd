import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { Mars, Venus } from 'lucide-react';
import Card, { calculateAge } from './Card';
import Pill from './Pill';
import { cardsApi, decisionApi, petitionApi } from '../services/api';
import config from '../services/config';
import { useAlert } from '../hooks/useAlert';

// This component should be renamed to PetCardStack
export default function CardStack({ openPetDetails }) {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processedAnimals, setProcessedAnimals] = useState(new Set()); // Track processed animals
  const [isProcessing, setIsProcessing] = useState(false); // Prevent rapid successive calls
  const [cardIndex, setCardIndex] = useState(0); // For card animation keys
  const [petBuffer, setPetBuffer] = useState([]); // Buffer of available pets
  const [currentIndex, setCurrentIndex] = useState(0); // Track which pet we're showing
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Background fetching
  const { showError, showSuccess } = useAlert();

  const BUFFER_SIZE = 8; // Keep 8 pets in buffer
  const REFETCH_THRESHOLD = 4; // Refetch when buffer has 4 or fewer pets remaining

  // Fetch pets from API and update the buffer
  const fetchPets = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      
      // Log data source for debugging
      console.log(`Using ${config.api.useMockData ? 'mock data' : 'API data'} for pets`);
      
      // API call to fetch pets (real or mock) - backend should filter out decided pets
      const response = await cardsApi.getAllCards();
      console.log('Pets data received:', response.data.length, 'pets');
      
      const availablePets = response.data || [];
      
      if (isInitial) {
        // Initial load - set the entire buffer
        setPetBuffer(availablePets);
        setCurrentIndex(0);
        createCurrentCards(availablePets, 0);
      } else {
        // Background refresh - update buffer with new pets
        setPetBuffer(availablePets);
      }
      
    } catch (err) {
      console.error('Error fetching pets:', err);
      if (isInitial) {
        showError('Error al cargar las mascotas. Inténtalo de nuevo.');
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setIsFetchingMore(false);
      }
    }
  };

  // Create the current cards from buffer (current + next for smooth animation)
  const createCurrentCards = (buffer, index) => {
    const currentPet = buffer[index];
    const nextPet = buffer[index + 1];
    
    if (!currentPet) {
      setCards([]);
      return;
    }

    const newCards = [];
    
    // Always add the current (front) card
    newCards.push({ 
      id: `card-${cardIndex}`, 
      pet: currentPet 
    });
    
    // Add the next (back) card if available for smooth transitions
    if (nextPet) {
      newCards.push({ 
        id: `card-${cardIndex + 1}`, 
        pet: nextPet 
      });
    }
    
    setCards(newCards);
  };

  // Initial load
  useEffect(() => {
    fetchPets(true);
  }, []);

  // Handle optimistic swipe to next card (one by one)
  const handleOptimisticSwipe = () => {
    const nextIndex = currentIndex + 1;
    
    // Immediately increment card index for smooth animation
    setCardIndex(prev => prev + 1);
    
    // Check if we have enough pets for the next card
    if (nextIndex < petBuffer.length) {
      // We have pets, show the next card immediately
      setCurrentIndex(nextIndex);
      createCurrentCards(petBuffer, nextIndex);
      
      // Check if we need to refetch in the background
      const remainingPets = petBuffer.length - nextIndex;
      if (remainingPets <= REFETCH_THRESHOLD && !isFetchingMore) {
        console.log('Buffer running low, refetching pets...');
        fetchPets(false);
      }
    } else {
      // No more pets available
      setCards([]);
      // Try to refetch in case there are new pets
      if (!isFetchingMore) {
        fetchPets(false);
      }
    }
  };

  // Update cards when buffer is refreshed
  useEffect(() => {
    if (petBuffer.length > 0 && cards.length === 0) {
      // If we have no cards but pets are available, create current cards
      createCurrentCards(petBuffer, currentIndex);
    }
  }, [petBuffer]);

  // Handle left swipe (ignore animal)
  const handleIgnoreAnimal = async (petId) => {
    // Prevent duplicate processing
    if (isProcessing || processedAnimals.has(petId)) {
      return;
    }

    // Immediately trigger optimistic animation
    handleOptimisticSwipe();

    try {
      setIsProcessing(true);
      setProcessedAnimals(prev => new Set([...prev, petId]));

      await decisionApi.createDecision({
        animal: petId,
        tipo_decision: 'IGNORAR'
      });
      console.log('Animal ignored successfully with ID:', petId);
      
    } catch (err) {
      console.error('Error ignoring animal:', err);
      // Remove from processed set on error
      setProcessedAnimals(prev => {
        const newSet = new Set(prev);
        newSet.delete(petId);
        return newSet;
      });
      showError('Error al procesar tu decisión. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle right swipe (request adoption)
  const handleRequestAdoption = async (petId) => {
    // Prevent duplicate processing
    if (isProcessing || processedAnimals.has(petId)) {
      return;
    }

    // Immediately trigger optimistic animation
    handleOptimisticSwipe();

    try {
      setIsProcessing(true);
      setProcessedAnimals(prev => new Set([...prev, petId]));

      // First create the decision
      await decisionApi.createDecision({
        animal: petId,
        tipo_decision: 'SOLICITAR'
      });
      console.log('Decision created for pet with ID:', petId);

      // Then create the petition
      await petitionApi.createPetition({
        animal: petId
      });
      console.log('Petition created for pet with ID:', petId);
      
      showSuccess('¡Solicitud de adopción enviada correctamente!');
      
    } catch (err) {
      console.error('Error requesting adoption:', err);
      
      // Remove from processed set on error
      setProcessedAnimals(prev => {
        const newSet = new Set(prev);
        newSet.delete(petId);
        return newSet;
      });
      
      // Handle specific error cases
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle IntegrityError for duplicate petition
        if (errorData.detail && (
          errorData.detail.includes('already exists') || 
          errorData.detail.includes('UNIQUE constraint') ||
          errorData.detail.includes('duplicate')
        )) {
          showError('Ya has enviado una solicitud para este animal.');
        } else if (errorData.animal && errorData.animal[0]) {
          showError(errorData.animal[0]);
        } else if (errorData.non_field_errors && errorData.non_field_errors[0]) {
          // Handle Django's unique_together constraint error
          if (errorData.non_field_errors[0].includes('already exists') || 
              errorData.non_field_errors[0].includes('unique')) {
            showError('Ya has enviado una solicitud para este animal.');
          } else {
            showError(errorData.non_field_errors[0]);
          }
        } else {
          showError('Error al enviar la solicitud. Inténtalo de nuevo.');
        }
      } else if (err.message && err.message.includes('IntegrityError')) {
        showError('Ya has enviado una solicitud para este animal.');
      } else {
        showError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orchid-500"></div>
      </div>
    );
  }

  if (cards.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center p-4">
        <div>
          <p className="text-amber-500 mb-2">No hay más mascotas disponibles</p>
          <p className="text-sm mt-4 text-gray-300">
            ¡Has visto todas las mascotas disponibles! Vuelve más tarde para ver nuevas mascotas.
          </p>
          {isFetchingMore && (
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orchid-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[900] md:relative md:h-[70vh] md:my-8 pointer-events-none pb-[calc(env(safe-area-inset-bottom)+80px)]"
      style={{ touchAction: 'pan-y' }}
    >
      <AnimatePresence>
        {cards.map((card, i) => (
          <Card
            key={card.id}
            frontCard={i === 0}
            index={cardIndex}
            setIndex={setCardIndex}
            drag={i === 0 ? true : false}
            img={card.pet.imagen1}
            petId={card.pet.id}
            petEspecie={card.pet.especie}
            openPetDetails={openPetDetails}
            onLike={() => handleRequestAdoption(card.pet.id)}
            onIgnore={() => handleIgnoreAnimal(card.pet.id)}
          >
            {/* Card content - updated for adoption */}
            <div className="absolute bottom-12 left-6 right-6 flex flex-col items-start">
              <h2 className="text-white flex items-center gap-2 flex-wrap">
                <span className="np-bold text-[clamp(1.75rem,5vw,2.5rem)] tracking-wide">
                  {card.pet.nombre}
                </span>
                {card.pet.genero === 'macho' ? (
                  <Mars 
                    size={25} 
                    strokeWidth={2.5} 
                    className="text-blue-400 drop-shadow-sm" 
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                  />
                ) : (
                  <Venus 
                    size={25} 
                    strokeWidth={2.5} 
                    className="text-pink-400 drop-shadow-sm" 
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                  />
                )}
              </h2>
              
              <p className="np-regular text-white/80 text-[clamp(1rem,3.5vw,1.25rem)] mt-0.5">
                {card.pet.raza}, {calculateAge(card.pet.fecha_nacimiento)} {calculateAge(card.pet.fecha_nacimiento) === 1 ? 'año' : 'años'}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {card.pet.tamano === 'pequeño' ? 'Pequeño' : 
                   card.pet.tamano === 'mediano' ? 'Mediano' : 'Grande'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
