import { useState } from 'react';
import CardStack from '../components/CardStack';
import PetDetailSection from '../components/PetDetailSection';

export default function FeedPage() {
  const [petDetailsOpen, setPetDetailsOpen] = useState(false);
  const [activePetId, setActivePetId] = useState(null);

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
      <div className="flex flex-col items-center justify-center h-full">
        <CardStack openPetDetails={openPetDetails} />
      </div>
      
      <PetDetailSection 
        isOpen={petDetailsOpen} 
        onClose={closePetDetails} 
        petId={activePetId} 
      />
    </>
  );
}
