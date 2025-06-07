import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  initialIndex = 0, 
  petName = '' 
}) => {
  console.log('ImageModal rendered with props:', { isOpen, images, initialIndex, petName });
  
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for left, 1 for right, 0 for no animation

  // Filter out empty/null images
  const validImages = images.filter(img => img && img.trim() !== '');

  // Reset states when modal opens/closes or image changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialIndex >= 0 && initialIndex < validImages.length ? initialIndex : 0);
    }
  }, [isOpen, initialIndex, validImages.length]);  // Navigation functions
  const goToNext = useCallback(() => {
    if (validImages.length > 1) {
      setSlideDirection(1); // Moving right (next)
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }
  }, [validImages.length]);

  const goToPrevious = useCallback(() => {
    if (validImages.length > 1) {
      setSlideDirection(-1); // Moving left (previous)
      setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  }, [validImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        default:
          break;
      }
    };    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToNext, goToPrevious]);  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[2100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
      >
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden max-w-4xl max-h-[80vh] w-full shadow-2xl"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >          {/* Header */}
          <div className="flex justify-between items-center p-4 relative">
            <h2 className="text-lg np-bold text-white">
              {petName && `${petName} - `}Imagen {currentImageIndex + 1} de {validImages.length}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white hover:text-white transition-colors"
              title="Cerrar"
            >
              <X size={24} />
            </button>
            {/* Divider line with gaps */}
            <div className="absolute bottom-0 left-8 right-8 h-px bg-white/10"></div>
          </div>          {/* Image Container */}
          <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 'calc(80vh - 100px)' }}>
            {/* Main Image with swipe functionality */}
            <motion.div
              className="flex items-center justify-center w-full h-full"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                const threshold = 50;
                if (info.offset.x > threshold && validImages.length > 1) {
                  goToPrevious();
                } else if (info.offset.x < -threshold && validImages.length > 1) {
                  goToNext();
                }
              }}
            >
              <AnimatePresence mode="wait" custom={slideDirection}>
                <motion.img
                  key={`image-${currentImageIndex}`}
                  custom={slideDirection}
                  initial={(direction) => ({
                    x: direction > 0 ? 300 : direction < 0 ? -300 : 0,
                    opacity: 0
                  })}
                  animate={{ x: 0, opacity: 1 }}
                  exit={(direction) => ({
                    x: direction > 0 ? -300 : direction < 0 ? 300 : 0,
                    opacity: 0
                  })}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.4
                  }}
                  src={validImages[currentImageIndex]}
                  alt={`${petName} - Imagen ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  draggable={false}
                  onError={(e) => {
                    console.error('Error loading image:', e);
                  }}
                  onAnimationComplete={() => setSlideDirection(0)}
                />
              </AnimatePresence>
            </motion.div>
            
            {/* Navigation Indicators */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {validImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      const direction = index > currentImageIndex ? 1 : index < currentImageIndex ? -1 : 0;
                      setSlideDirection(direction);
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Swipe Instruction */}
            {validImages.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm np-regular">
                Desliza para ver más imágenes
              </div>
            )}
          </div>        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

ImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  initialIndex: PropTypes.number,
  petName: PropTypes.string
};

export default ImageModal;
