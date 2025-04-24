import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from './Card';

// Imágenes de ejemplo de gatos con información de raza
const cats = [
  {
    name: "Mochi",
    img: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&w=600&q=80",
    breed: "Fold Escocés",
    age: 2
  },
  {
    name: "Luna",
    img: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&w=600&q=80",
    breed: "Siamés",
    age: 3
  },
  {
    name: "Simba",
    img: "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&w=600&q=80",
    breed: "Maine Coon",
    age: 4
  },
  {
    name: "Nala",
    img: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&w=600&q=80",
    breed: "Persa",
    age: 1
  }
];

export default function CardStack() {
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
      className="fixed inset-0 flex items-center justify-center z-[900] md:static md:relative md:h-[70vh] md:my-8 pointer-events-none"
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
          >
            {/* Superposición de información de tarjeta estilo Tinder */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start">
              <h2 className="np-title np-bold text-white text-3xl tracking-wide flex items-center gap-2">
                {card.cat.name}
                <span className="np-extralight text-white/70 text-xl font-normal ml-2">{card.cat.age} años</span>
              </h2>
              <p className="np-regular text-white/80 text-lg mt-1">
                {card.cat.breed}
              </p>
            </div>
          </Card>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
