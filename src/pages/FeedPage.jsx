import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
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
  };

  // Function to handle closing pet details
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
    <>      {/* Main Feed Container with Light/Dark Theme Support */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-oxford-900 dark:to-marine-900 transition-colors duration-300 pt-20">
        {/* Cards Container */}
        <motion.div 
          className="flex flex-col items-center justify-center px-4 pb-24 min-h-screen"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="w-full max-w-sm relative">
            {/* Card Shadow/Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-orchid-500/20 to-aquamarine-400/20 dark:from-orchid-500/30 dark:to-aquamarine-400/30 rounded-3xl blur-xl opacity-75"></div>
            
            {/* CardStack with relative positioning */}
            <div className="relative">
              <CardStack openPetDetails={openPetDetails} />
            </div>          </div>
        </motion.div>
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
