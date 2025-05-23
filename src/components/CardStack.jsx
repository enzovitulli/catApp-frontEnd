import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from './Card';
import { cardsApi } from '../services/api';

export default function CardStack({ openComments }) {
  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [cats, setCats] = useState([]); // Start with empty array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all cats from API
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // API call to fetch cats (real or mock)
        const response = await cardsApi.getAllCards();
        setCats(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching cats:', err);
        setError('Failed to load cats. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchCats();
  }, []);

  // Reiniciar el mazo de tarjetas con el índice actual
  useEffect(() => {
    // Only proceed if we have cats data
    if (cats.length === 0) return;
    
    const frontCat = cats[index % cats.length];
    const backCat = cats[(index + 1) % cats.length];
    
    setCards([
      { id: index, cat: frontCat },
      { id: index + 1, cat: backCat }
    ]);
  }, [index, cats]);

  // Handle liking a cat
  const handleLikeCat = async (catId) => {
    try {
      await cardsApi.likeCat(catId);
      console.log('Liked cat with ID:', catId);
      
      // Optimistic UI update (update local state immediately)
      // Here you might update the like count or liked status
    } catch (err) {
      console.error('Error liking cat:', err);
    }
  };

  if (isLoading && cats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lavender-500"></div>
      </div>
    );
  }

  if (error && cats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center p-4">
        <div>
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-lavender-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
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
            img={card.cat.img}
            catId={card.cat.id}
            openComments={openComments}
            onLike={() => handleLikeCat(card.cat.id)}
            commentsCount={card.cat.commentsCount}
          >
            {/* Card content */}
            <div className="absolute bottom-12 left-6 right-6 flex flex-col items-start">
              <h2 className="text-white flex items-center gap-2 flex-wrap">
                <span className="np-bold text-[clamp(1.75rem,5vw,2.5rem)] tracking-wide">
                  {card.cat.name}
                </span>
                <span className="np-regular text-white/70 text-[clamp(0.9rem,2.5vw,1.4rem)]">
                  @{card.cat.ownerUsername}
                </span>
              </h2>
              
              <p className="np-regular text-white/80 text-[clamp(1rem,3.5vw,1.25rem)] mt-0.5">
                {card.cat.breed}, {card.cat.age} {card.cat.age === 1 ? 'año' : 'años'}
              </p>
            </div>
          </Card>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
