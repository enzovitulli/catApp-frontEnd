import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { ChevronUp } from 'lucide-react';

// Helper function to calculate age from fecha_nacimiento
export const calculateAge = (fechaNacimiento) => {
  if (!fechaNacimiento) return 0;
  
  const birthDate = new Date(fechaNacimiento);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // If birthday hasn't occurred this year yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export default function Card(props) {
  const [exitXY, setExitXY] = useState({ x: 0, y: 0 });
  const [showIndicator, setShowIndicator] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);
  const swipeThreshold = 100; // Minimum swipe distance to trigger actions
  const initialTouchY = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-150, 0, 150], [-45, 0, 45], { clamp: false });
  const arrowY = useMotionValue(0);
  
  // Create blinking up animation for the arrow
  useState(() => {
    if (props.frontCard) {
      const controls = animate(arrowY, [-5, 0, -5], {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      });
      
      return () => controls.stop();
    }
  }, [props.frontCard]);

  // Show indicator after 4 seconds of inactivity
  useEffect(() => {
    if (!props.frontCard) return;
    
    // Clear any existing timeouts when card changes
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    
    // Initially hide the indicator
    setShowIndicator(false);
    
    // Set a timeout to show the indicator after 4 seconds
    interactionTimeoutRef.current = setTimeout(() => {
      if (!isInteracting) {
        setShowIndicator(true);
      }
    }, 4000);
    
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [props.frontCard, isInteracting]);

  // Handle user interactions
  const handleInteractionStart = () => {
    setIsInteracting(true);
    setShowIndicator(false);
    
    // Clear the existing timeout if there is one
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  };
  
  const handleInteractionEnd = () => {
    setIsInteracting(false);
    
    // Restart the timeout to show the indicator after interaction ends
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    
    interactionTimeoutRef.current = setTimeout(() => {
      setShowIndicator(true);
    }, 4000);
  };

  const variantsFrontCard = {
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: (custom) => ({
      x: custom.x,
      y: custom.y,
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.2 }
    })
  };
  const variantsBackCard = {
    initial: { scale: 0, y: 105, opacity: 0 },
    animate: { scale: 0.75, y: 30, opacity: 0.5 }
  };

  function handleDragEnd(_, info) {
    // Horizontal swipe handling (left/right)
    if (info.offset.x < -swipeThreshold) {
      // Left swipe - ignore animal
      setExitXY({ x: -250, y: 0 });
      if (props.onIgnore) {
        props.onIgnore(props.petId);
      }
      return;
    }
    if (info.offset.x > swipeThreshold) {
      // Right swipe - request adoption
      setExitXY({ x: 250, y: 0 });
      if (props.onLike) {
        props.onLike(props.petId);
      }
      return;
    }
    
    // Vertical swipe handling (up to open pet details)
    if (info.offset.y < -swipeThreshold && props.frontCard && props.openPetDetails) {
      props.openPetDetails(props.petId);
      return;
    }
    
    // Card returns to center if not swiped enough in any direction
  }

  // Track touch events to distinguish between swipe up and regular vertical scrolling
  const handleTouchStart = (e) => {
    if (props.frontCard) {
      initialTouchY.current = e.touches[0].clientY;
      handleInteractionStart();
    }
  };

  const handleTouchEnd = (e) => {
    if (props.frontCard && initialTouchY.current && e.changedTouches[0]) {
      const deltaY = initialTouchY.current - e.changedTouches[0].clientY;
      // If swiped upward significantly, open pet details
      if (deltaY > swipeThreshold && props.openPetDetails) {
        e.stopPropagation(); // Prevent event bubbling
        props.openPetDetails(props.petId);
      }
      initialTouchY.current = null;
      handleInteractionEnd();
    }
  };

  // Update the comment indicator text based on pet type
  const getSwipeText = () => {
    // TODO: Rename petId related variables when refactoring
    const petEspecie = props.petEspecie || 'mascota';
    return `Desliza hacia arriba para ver detalles de ${petEspecie === 'perro' ? 'este perro' : 'este gato'}`;
  };

  return (
    <motion.div
      className="w-[90vw] max-w-[420px] aspect-[3/4] max-h-[min(600px,75vh)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl pointer-events-none"
      style={{
        x,
        y,
        rotate,
        cursor: props.drag ? "grab" : "default",
        boxShadow: "0 8px 32px 0 rgba(60,60,100,0.18)",
        zIndex: props.frontCard ? 'var(--z-front-card)' : 'var(--z-cards)'
      }}
      whileTap={{ cursor: "grabbing" }}
      drag={props.drag ? true : false}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      onDragEnd={handleDragEnd}
      onDragStart={handleInteractionStart}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      variants={props.frontCard ? variantsFrontCard : variantsBackCard}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={exitXY}
      transition={
        props.frontCard
          ? { type: "spring", stiffness: 300, damping: 20 }
          : { scale: { duration: 0.2 }, opacity: { duration: 0.4 } }
      }
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        className="w-full h-full relative pointer-events-auto" 
        style={{ scale }}
      >
        {/* Background image */}
        <img
          src={props.img || props.imagen1}
          alt=""
          className="w-full h-full object-cover rounded-3xl"
          draggable={false}
        />
        
        {/* Enhanced gradient overlay - taller to better support text */}
        <div 
          className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-3xl pointer-events-none" 
        />
        
        {/* Swipe up indicator with fade-in/out - now with adoption text */}
        {props.frontCard && (
          <motion.div 
            className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center pointer-events-none"
            animate={{ opacity: showIndicator ? 1 : 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center gap-0">
              <motion.div style={{ y: arrowY }}>
                <ChevronUp className="text-white/70" />
              </motion.div>
              <p className="text-xs text-white/70 -mt-1">{getSwipeText()}</p>
            </div>
          </motion.div>
        )}
        
        {/* Card content */}
        <div className="absolute inset-0 pointer-events-none z-60">
          {props.children}
        </div>
      </motion.div>
    </motion.div>
  );
}
