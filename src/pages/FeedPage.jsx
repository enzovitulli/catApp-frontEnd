import { useState } from 'react';
import CardStack from '../components/CardStack';
import PetDetailSection from '../components/PetDetailSection';
import ImageModal from '../components/ImageModal';

export default function FeedPage() {
  const [petDetailsOpen, setPetDetailsOpen] = useState(false);
  const [activePetId, setActivePetId] = useState(null);
  
  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalImages, setModalImages] = useState([]);
  const [modalPetName, setModalPetName] = useState('');

  // Function to handle opening pet details for a specific pet
  const openPetDetails = (petId) => {
    // Only open if not already open with the same pet
    if (petId !== activePetId || !petDetailsOpen) {
      setActivePetId(petId);
      setPetDetailsOpen(true);
    }
  };  // Function to handle closing pet details
  const closePetDetails = () => {
    console.log('closePetDetails called - this should only happen when user explicitly closes the pet details, not when opening modal');
    setPetDetailsOpen(false);
    // Don't immediately clear the pet ID to allow animations to complete
  };

  // Function to handle opening image modal
  const handleImageModalOpen = (images, imageIndex, petName) => {
    console.log('handleImageModalOpen called - pet details should remain open');
    setModalImages(images);
    setSelectedImageIndex(imageIndex);
    setModalPetName(petName);
    setIsImageModalOpen(true);
  };

  // Function to handle closing image modal
  const handleImageModalClose = () => {
    console.log('handleImageModalClose called - pet details should still be open');
    setIsImageModalOpen(false);
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
        onImageModalOpen={handleImageModalOpen}
      />
      
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={handleImageModalClose}
        images={modalImages}
        initialIndex={selectedImageIndex}
        petName={modalPetName}
      />
    </>
  );
}
