import Navbar from './components/Navbar';
import Header from './components/Header';
import CardStack from './components/CardStack';
import PetDetailSection from './components/PetDetailSection';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [petDetailsOpen, setPetDetailsOpen] = useState(false); // Renamed from commentsOpen
  const [activePetId, setActivePetId] = useState(null); // Renamed from activeCardId

  // Function to handle opening pet details for a specific pet
  const openPetDetails = (petId) => {
    // Only open if not already open with the same pet
    if (petId !== activePetId || !petDetailsOpen) {
      setActivePetId(petId);
      setPetDetailsOpen(true);
    }
  };

  // Function to handle closing pet details
  const closePetDetails = () => {
    setPetDetailsOpen(false);
    // Don't immediately clear the pet ID to allow animations to complete
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
          <div className="h-full">
            {activeTab === 'home' && (
              <div className="flex flex-col items-center justify-center h-full">
                <CardStack openPetDetails={openPetDetails} />
              </div>
            )}
            {activeTab === 'cat' && <div>Mascotas en Adopción</div>} 
            {activeTab === 'message' && <div>Contacto</div>}
            {activeTab === 'heart' && <div>Favoritos</div>}
          </div>
        </div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <PetDetailSection 
          isOpen={petDetailsOpen} 
          onClose={closePetDetails} 
          petId={activePetId} 
        />
      </div>
    </>
  )
}

export default App
