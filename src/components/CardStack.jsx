import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import Card, { calculateAge } from './Card';
import { cardsApi } from '../services/api';
import config from '../services/config';

// This component should be renamed to PetCardStack
export default function CardStack({ openPetDetails }) {
  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all pets from API
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Log data source for debugging
        console.log(`Using ${config.api.useMockData ? 'mock data' : 'API data'} for pets`);
        
        // API call to fetch pets (real or mock)
        const response = await cardsApi.getAllCards();
        console.log('Pets data received:', response.data.length, 'pets');
        console.log(response.data);
        
        // Set pets data from the response
        setPets(response.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError('Failed to load pets. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Reset the card deck with current index
  useEffect(() => {
    // Only proceed if we have pets data
    if (pets.length === 0) return;
    
    const frontPet = pets[index % pets.length];
    const backPet = pets[(index + 1) % pets.length];
    
    setCards([
      { id: index, pet: frontPet },
      { id: index + 1, pet: backPet }
    ]);
  }, [index, pets]);

  // Handle liking a pet
  const handleLikePet = async (petId) => {
    try {
      await cardsApi.likePet(petId);
      console.log('Liked pet with ID:', petId);
      
      // Optimistic UI update (update local state immediately)
    } catch (err) {
      console.error('Error liking pet:', err);
    }
  };

  if (isLoading && pets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orchid-500"></div>
      </div>
    );
  }

  if (error && pets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center p-4">
        <div>
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-orchid-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
          <p className="text-sm mt-4 text-gray-300">
            If the API is down, you can <span className="font-semibold">toggle useMockData to true</span> in config.js
          </p>
        </div>
      </div>
    );
  }

  if (pets.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center p-4">
        <div>
          <p className="text-amber-500 mb-2">No pets available right now</p>
          <p className="text-sm mt-4 text-gray-300">
            You can toggle useMockData to true in config.js to view sample pets
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[900] md:static md:relative md:h-[70vh] md:my-8 pointer-events-none pb-[calc(env(safe-area-inset-bottom)+80px)]"
      style={{ touchAction: 'pan-y' }}
    >
      <AnimatePresence>
        {cards.map((card, i) => (
          <Card
            key={card.id}
            frontCard={i === 0}
            index={index}
            setIndex={setIndex}
            drag={i === 0 ? true : false}
            img={card.pet.imagen1}
            petId={card.pet.id}
            petEspecie={card.pet.especie}
            openPetDetails={openPetDetails}
            onLike={() => handleLikePet(card.pet.id)}
          >
            {/* Card content - updated for adoption */}
            <div className="absolute bottom-12 left-6 right-6 flex flex-col items-start">
              <h2 className="text-white flex items-center gap-2 flex-wrap">
                <span className="np-bold text-[clamp(1.75rem,5vw,2.5rem)] tracking-wide">
                  {card.pet.nombre}
                </span>
              </h2>
              
              <p className="np-regular text-white/80 text-[clamp(1rem,3.5vw,1.25rem)] mt-0.5">
                {card.pet.raza}, {calculateAge(card.pet.fecha_nacimiento)} {calculateAge(card.pet.fecha_nacimiento) === 1 ? 'año' : 'años'}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {card.pet.tamano === 'pequeño' ? 'Pequeño' : 
                   card.pet.tamano === 'mediano' ? 'Mediano' : 'Grande'}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {card.pet.genero === 'macho' ? '♂ Macho' : '♀ Hembra'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
