import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  initialIndex = 0, 
  petName = '' 
}) => {
  console.log('ImageModal rendered with props:', { isOpen, images, initialIndex, petName });
  
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const swiperRef = useRef(null);

  // Filter out empty/null images
  const validImages = images.filter(img => img && img.trim() !== '');
  // Reset states when modal opens/closes or image changes
  useEffect(() => {
    if (isOpen) {
      const newIndex = initialIndex >= 0 && initialIndex < validImages.length ? initialIndex : 0;
      setCurrentImageIndex(newIndex);
      
      // Update swiper to the correct slide with a small delay to ensure it's initialized
      const timer = setTimeout(() => {
        if (swiperRef.current?.swiper) {
          swiperRef.current.swiper.slideTo(newIndex, 0);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialIndex, validImages.length]);

  // Additional effect to handle swiper initialization
  useEffect(() => {
    if (isOpen && swiperRef.current?.swiper && currentImageIndex !== swiperRef.current.swiper.activeIndex) {
      swiperRef.current.swiper.slideTo(currentImageIndex, 0);
    }
  }, [isOpen, currentImageIndex]);

  // Keyboard navigation for modal close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  const handleSlideChange = (swiper) => {
    setCurrentImageIndex(swiper.activeIndex);
  };

  const handleSwiperInit = (swiper) => {
    // Ensure swiper starts at the correct slide when initialized
    if (currentImageIndex !== swiper.activeIndex) {
      swiper.slideTo(currentImageIndex, 0);
    }
  };

  return (
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
        >
          {/* Header */}
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
          </div>

          {/* Image Container with Swiper */}
          <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 'calc(80vh - 100px)' }}>            <Swiper
              key={`swiper-${isOpen}-${initialIndex}`}
              ref={swiperRef}
              modules={[Navigation, Pagination, Keyboard]}
              spaceBetween={20}
              slidesPerView={1}
              centeredSlides={true}
              initialSlide={currentImageIndex}
              onSwiper={handleSwiperInit}
              onSlideChange={handleSlideChange}
              keyboard={{
                enabled: true,
                onlyInViewport: false
              }}
              pagination={{
                clickable: true,
                renderBullet: (index, className) => {
                  return `<span class="${className} !bg-white/50 hover:!bg-white/75 !w-2 !h-2"></span>`;
                }
              }}
              effect="slide"
              speed={300}
              className="w-full h-full swiper-image-modal"
            >{validImages.map((image, index) => (
                <SwiperSlide key={`slide-${image}-${index}`} className="!flex !items-center !justify-center !w-full !h-full">
                  <img
                    src={image}
                    alt={`${petName} - Imagen ${index + 1}`}
                    className="max-w-full max-h-full object-contain pointer-events-none block mx-auto"
                    draggable={false}
                    onError={(e) => {
                      console.error('Error loading image:', e);
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Swipe Instruction */}
            {validImages.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm np-regular z-10">
                Desliza para ver más imágenes
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>  );
};

ImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  initialIndex: PropTypes.number,
  petName: PropTypes.string
};

export default ImageModal;
