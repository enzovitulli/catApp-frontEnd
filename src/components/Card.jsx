import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

export default function Card(props) {
  const [exitXY, setExitXY] = useState({ x: 0, y: 0 });
  const swipeThreshold = 100; // Minimum swipe distance to trigger actions
  const initialTouchY = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-150, 0, 150], [-45, 0, 45], { clamp: false });

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
      setExitXY({ x: -250, y: 0 });
      props.onSwipe && props.onSwipe('left');
      props.setIndex(props.index + 1);
      return;
    }
    if (info.offset.x > swipeThreshold) {
      setExitXY({ x: 250, y: 0 });
      props.onSwipe && props.onSwipe('right');
      props.setIndex(props.index + 1);
      return;
    }
    
    // Vertical swipe handling (up to open comments)
    if (info.offset.y < -swipeThreshold && props.frontCard && props.openComments) {
      props.openComments(props.catId);
      return;
    }
    
    // Card returns to center if not swiped enough in any direction
  }

  // Track touch events to distinguish between swipe up and regular vertical scrolling
  const handleTouchStart = (e) => {
    if (props.frontCard) {
      initialTouchY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (props.frontCard && initialTouchY.current && e.changedTouches[0]) {
      const deltaY = initialTouchY.current - e.changedTouches[0].clientY;
      // If swiped upward significantly, open comments
      if (deltaY > swipeThreshold && props.openComments) {
        props.openComments(props.catId);
      }
      initialTouchY.current = null;
    }
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
          src={props.img}
          alt=""
          className="w-full h-full object-cover rounded-3xl"
          draggable={false}
        />
        
        {/* Enhanced gradient overlay - taller to better support text */}
        <div 
          className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-3xl pointer-events-none" 
        />
        
        {/* Swipe up indicator */}
        {props.frontCard && (
          <div className="absolute top-4 left-0 right-0 flex justify-center items-center pointer-events-none">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <p className="text-xs text-white">Desliza hacia arriba para comentarios</p>
            </div>
          </div>
        )}
        
        {/* Card content */}
        <div className="absolute inset-0 pointer-events-none z-60">
          {props.children}
        </div>
      </motion.div>
    </motion.div>
  );
}
