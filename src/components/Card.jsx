import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

export default function Card(props) {
  const [exitXY, setExitXY] = useState({ x: 0, y: 0 });

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
    // Deslizar a la izquierda
    if (info.offset.x < -100) {
      setExitXY({ x: -250, y: 0 });
      props.onSwipe && props.onSwipe('left');
      props.setIndex(props.index + 1);
      return;
    }
    if (info.offset.x > 100) {
      setExitXY({ x: 250, y: 0 });
      props.onSwipe && props.onSwipe('right');
      props.setIndex(props.index + 1);
      return;
    }
    // Arriba/abajo: no hacer nada, la tarjeta vuelve al centro
  }

  return (
    <motion.div
      className="w-[90vw] max-w-[420px] h-[75vh] max-h-[600px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl pointer-events-none"
      style={{
        x,
        y,
        rotate,
        cursor: props.drag ? "grab" : "default",
        boxShadow: "0 8px 32px 0 rgba(60,60,100,0.18)",
        zIndex: props.frontCard ? 1000 : 999
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
    >
      <motion.div
        className="w-full h-full relative pointer-events-auto" 
        style={{
          scale,
        }}
      >
        {/* Fondo de imagen */}
        <img
          src={props.img}
          alt=""
          className="w-full h-full object-cover rounded-3xl"
          draggable={false}
        />
        
        {/* Superposición de degradado en la parte inferior */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-3xl pointer-events-none" />
        
        {/* Contenido de la tarjeta con z-index más alto */}
        <div className="absolute inset-0 pointer-events-none z-60">
          {props.children}
        </div>
      </motion.div>
    </motion.div>
  );
}
