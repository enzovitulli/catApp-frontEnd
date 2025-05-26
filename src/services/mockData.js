/**
 * Mock data for development and testing
 */

// Helper function to count total comments including replies - retained for compatibility
function countTotalComments(comments) {
  return comments.reduce((total, comment) => {
    let count = 1;
    if (comment.replies && comment.replies.length > 0) {
      count += comment.replies.length;
    }
    return total + count;
  }, 0);
}

// Mockup pet data with translated Spanish compatibility options
export const mockupPets = [
  {
    id: "pet1",
    name: "Mochi",
    img: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&w=600&q=80",
    breed: "Fold Escocés",
    age: 2,
    size: "medium",
    
    // Pet information
    species: "gato",
    gender: "macho",
    temperament: "Mochi es un gato juguetón y cariñoso. Le encanta estar cerca de la gente y siempre está buscando atención. Es muy curioso y le gusta explorar nuevos lugares.",
    
    // Updated compatibility options with Spanish values
    goodWithKids: "excelente",
    kidsNote: "Es muy paciente con los niños y disfruta jugando con ellos",
    
    goodWithPets: "bienConGatos", 
    petsNote: "Se lleva bien con otros gatos pero no ha sido probado con perros",
    
    goodForApartment: "ideal",
    apartmentNote: "Perfecto para espacios pequeños, no necesita mucho espacio para correr",
    
    // Health status
    hasChip: true,
    isVaccinated: true,
    isDewormed: true,
    isNeutered: true,
    
    bio: "Mochi fue encontrado abandonado cuando tenía apenas 3 meses. Una familia lo acogió temporalmente pero no podía quedarse con él permanentemente. Es muy limpio y ya está entrenado para usar la caja de arena. Busca un hogar donde pueda recibir mucho cariño y atención."
  },
  {
    id: "pet2",
    name: "Luna",
    img: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&w=600&q=80",
    breed: "Siamés",
    age: 3,
    size: "small",
    
    species: "gato",
    gender: "hembra",
    temperament: "Luna es una gata tranquila y algo tímida al principio, pero una vez que confía en ti, es extremadamente afectuosa y leal.",
    
    goodWithKids: "noRecomendado",
    kidsNote: "Prefiere un ambiente tranquilo sin niños pequeños",
    
    goodWithPets: "prefiereSolo", 
    petsNote: "Prefiere ser la única mascota en casa",
    
    goodForApartment: "ideal",
    apartmentNote: "Ideal para departamentos, es muy tranquila",
    
    hasChip: true,
    isVaccinated: true,
    isDewormed: true,
    isNeutered: true,
    
    bio: "Luna llegó al refugio después de que su dueño anterior falleciera. Es una gata muy tranquila que disfruta de momentos de paz y quietud. Le encanta dormir en los rayos de sol y observar por la ventana. Busca un hogar tranquilo donde pueda sentirse segura."
  },
  {
    id: "pet3",
    name: "Simba",
    img: "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&w=600&q=80",
    breed: "Maine Coon",
    age: 4,
    size: "large",
    
    species: "gato",
    gender: "macho",
    temperament: "Simba es un gato majestuoso y seguro de sí mismo. Tiene una personalidad fuerte pero es extremadamente leal y protector con su familia.",
    
    goodWithKids: "bueno",
    kidsNote: "Se lleva bien con niños respetuosos que entiendan sus límites",
    
    goodWithPets: "selectivo", 
    petsNote: "Se lleva bien con perros y otros gatos si se hace una introducción adecuada",
    
    goodForApartment: "requiereEspacio",
    apartmentNote: "Necesita espacio para explorar y ejercitarse",
    
    hasChip: true,
    isVaccinated: true,
    isDewormed: true,
    isNeutered: false,
    
    bio: "Simba fue rescatado de una situación de acumulación de animales. A pesar de su difícil inicio, es un gato equilibrado y sociable. Disfruta de los juegos interactivos y es muy inteligente. Aprende rápido y le gusta resolver puzzles para gatos."
  },
  {
    id: "pet4",
    name: "Nala",
    img: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&w=600&q=80",
    breed: "Persa",
    age: 1,
    size: "small",
    
    species: "gato",
    gender: "hembra",
    temperament: "Nala es dulce, delicada y algo tímida. Necesita tiempo para adaptarse a nuevos entornos pero una vez que se siente cómoda, es muy cariñosa.",
    
    goodWithKids: "precaucion",
    kidsNote: "Muy asustadiza con movimientos bruscos, mejor con niños mayores y calmados",
    
    goodWithPets: "desconocido", 
    petsNote: null,
    
    goodForApartment: "bueno",
    apartmentNote: "Perfecta para espacios pequeños, es muy tranquila",
    
    hasChip: false,
    isVaccinated: true,
    isDewormed: true,
    isNeutered: true
    // No bio provided to test the "no bio available" message
  },
  {
    id: "pet5",
    name: "Rocky",
    img: "https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&w=600&q=80",
    breed: "Labrador Retriever",
    age: 2,
    size: "large",
    
    species: "perro",
    gender: "macho",
    temperament: "Rocky es un perro extremadamente amigable, juguetón y lleno de energía. Le encanta correr, jugar a buscar y estar con personas.",
    
    goodWithKids: "excelente",
    kidsNote: "Excelente con niños de todas las edades, muy paciente y protector",
    
    goodWithPets: "bienConPerros", 
    petsNote: "Se lleva bien con otros perros, no ha sido probado con gatos",
    
    goodForApartment: "soloConJardin",
    apartmentNote: "Necesita espacio y ejercicio diario, mejor en casa con jardín",
    
    hasChip: true,
    isVaccinated: true,
    isDewormed: true,
    isNeutered: true,
    
    bio: "Rocky es un labrador de 2 años con mucha energía y ganas de jugar. Fue entregado al refugio porque sus dueños se mudaron a un apartamento donde no podían tenerlo. Es un perro obediente que ya conoce comandos básicos como sentarse y dar la pata. Busca una familia activa que pueda darle el ejercicio que necesita."
  },
  {
    id: "pet6",
    name: "Max",
    img: "https://images.pexels.com/photos/551628/pexels-photo-551628.jpeg?auto=compress&w=600&q=80",
    breed: "Beagle",
    age: 5,
    size: "medium",
    
    species: "perro",
    gender: "macho",
    temperament: "Max es un perro tranquilo y cariñoso que disfruta de paseos largos y dormir junto a su familia.",
    
    goodWithKids: "desconocido",
    kidsNote: null,
    
    goodWithPets: "excelente", 
    petsNote: "Muy sociable con otros perros y ha convivido con gatos",
    
    goodForApartment: "bueno",
    apartmentNote: "Puede vivir en apartamento si recibe suficiente ejercicio diario",
    
    hasChip: true,
    isVaccinated: true,
    isDewormed: true,
    isNeutered: true,
    
    bio: "Max proviene de un hogar donde ya no podían cuidarlo debido a alergias. Es un perro muy bien educado y sociable que adora a las personas y se adapta rápidamente a nuevas situaciones."
  }
];

// Keep this for backward compatibility but we won't use it anymore
export const MOCK_COMMENTS_BY_CAT = {
  // ...existing code...
};
