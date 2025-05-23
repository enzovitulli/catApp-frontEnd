import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from './Card';

// Imágenes de ejemplo de gatos con información de raza
const cats = [
  {
    id: "cat1",
    name: "Mochi",
    img: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&w=600&q=80",
    breed: "Fold Escocés",
    age: 2,
    ownerUsername: "whisker_lover"
  },
  {
    id: "cat2",
    name: "Luna",
    img: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&w=600&q=80",
    breed: "Siamés",
    age: 3,
    ownerUsername: "cat_lady89"
  },
  {
    id: "cat3",
    name: "Simba",
    img: "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&w=600&q=80",
    breed: "Maine Coon",
    age: 4,
    ownerUsername: "meow_master"
  },
  {
    id: "cat4",
    name: "Nala",
    img: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&w=600&q=80",
    breed: "Persa",
    age: 1,
    ownerUsername: "furry_friend22"
  }
];

export default function CardStack({ openComments }) {
  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState([]);

  // Reiniciar el mazo de tarjetas con el índice actual
  useEffect(() => {
    const frontCat = cats[index % cats.length];
    const backCat = cats[(index + 1) % cats.length];
    
    setCards([
      { id: index, cat: frontCat },
      { id: index + 1, cat: backCat }
    ]);
  }, [index]);

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
          >
            {/* Updated text layout for better responsiveness & positioning */}
            <div className="absolute bottom-12 left-6 right-6 flex flex-col items-start">
              <h2 className="text-white flex items-center gap-2 flex-wrap">
                <span className="np-bold text-[clamp(1.75rem,5vw,2.5rem)] tracking-wide">
                  {card.cat.name}
                </span>
                <span className="np-regular text-white/70 text-[clamp(0.9rem,2.5vw,1.4rem)]">
                  @{card.cat.ownerUsername}
                </span>
              </h2>
              
              <p className="np-regular text-white/80 text-[clamp(1rem,3.5vw,1.25rem)] mt-1">
                {card.cat.breed}, {card.cat.age} {card.cat.age === 1 ? 'año' : 'años'}
              </p>
            </div>
          </Card>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
