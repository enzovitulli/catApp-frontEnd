import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * ImageModal Component
 * 
 * A full-screen modal for viewing pet images with swipe/keyboard navigation
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {Array} images - Array of image URLs
 * @param {number} initialIndex - Index of the image to show initially
 * @param {string} petName - Name of the pet for accessibility
 */
const ImageModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  initialIndex = 0, 
  petName = 'Mascota' 
}) => {
  const swiperRef = useRef(null);

  // Handle keyboard events for closing modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset swiper to initial index when modal opens or initialIndex changes
  useEffect(() => {
    if (isOpen && swiperRef.current && images.length > 0) {
      // Small delay to ensure swiper is fully initialized
      setTimeout(() => {
        if (swiperRef.current && swiperRef.current.slideTo) {
          swiperRef.current.slideTo(initialIndex, 0); // 0 for no transition
        }
      }, 50);
    }
  }, [isOpen, initialIndex, images.length]);

  if (!isOpen || !images || images.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-[10001] p-3 bg-black/50 hover:bg-black/70 
                     text-white rounded-full transition-all duration-200 cursor-pointer
                     backdrop-blur-sm border border-white/20 hover:border-white/40"
          aria-label="Cerrar galería de imágenes"
        >
          <X size={24} />
        </motion.button>

        {/* Navigation arrows for desktop - only show if more than one image */}
        {images.length > 1 && (
          <>
            {/* Previous button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              onClick={(e) => {
                e.stopPropagation();
                if (swiperRef.current && swiperRef.current.slidePrev) {
                  swiperRef.current.slidePrev();
                }
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[10001] p-3 
                         bg-black/50 hover:bg-black/70 text-white rounded-full 
                         transition-all duration-200 cursor-pointer backdrop-blur-sm 
                         border border-white/20 hover:border-white/40
                         hidden md:flex items-center justify-center"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={24} />
            </motion.button>

            {/* Next button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              onClick={(e) => {
                e.stopPropagation();
                if (swiperRef.current && swiperRef.current.slideNext) {
                  swiperRef.current.slideNext();
                }
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[10001] p-3 
                         bg-black/50 hover:bg-black/70 text-white rounded-full 
                         transition-all duration-200 cursor-pointer backdrop-blur-sm 
                         border border-white/20 hover:border-white/40
                         hidden md:flex items-center justify-center"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={24} />
            </motion.button>
          </>
        )}

        {/* Swiper container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full h-full max-w-7xl max-h-full p-4 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            initialSlide={initialIndex}
            spaceBetween={30}
            centeredSlides={true}
            keyboard={{
              enabled: true,
              onlyInViewport: true,
            }}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active',
            }}
            className="swiper-image-modal h-full w-full"
            style={{
              '--swiper-pagination-color': 'rgba(255, 255, 255, 1)',
              '--swiper-pagination-bullet-inactive-color': 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center">
                <img
                  src={image}
                  alt={`${petName} - Imagen ${index + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  style={{
                    maxHeight: 'calc(100vh - 8rem)',
                    maxWidth: 'calc(100vw - 4rem)',
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

ImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  initialIndex: PropTypes.number,
  petName: PropTypes.string,
};

export default ImageModal;
