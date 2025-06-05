import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, CircleX, Info, X } from 'lucide-react';
import PropTypes from 'prop-types';

const Alert = ({ 
  type = 'info', 
  message, 
  isVisible, 
  onClose, 
  duration = 8000,
  className = '' 
}) => {const [show, setShow] = useState(isVisible);

  const handleClose = useCallback(() => {
    setShow(false);
    if (onClose) {
      // Delay the onClose callback to allow exit animation
      setTimeout(() => onClose(), 200);
    }
  }, [onClose]);

  // Auto-close after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }  }, [isVisible, duration, handleClose]);

  // Update local state when prop changes
  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);  // Alert type configurations
  const alertConfig = {
    success: {
      icon: Check,
      bgColor: 'bg-green-500/80',
      borderColor: 'border-green-400/50',
      textColor: 'text-white',
      iconColor: 'text-white',
      backdropColor: 'backdrop-blur-md'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500/80',
      borderColor: 'border-yellow-400/50',
      textColor: 'text-white',
      iconColor: 'text-white',
      backdropColor: 'backdrop-blur-md'
    },
    error: {
      icon: CircleX,
      bgColor: 'bg-red-500/80',
      borderColor: 'border-red-400/50',
      textColor: 'text-white',
      iconColor: 'text-white',
      backdropColor: 'backdrop-blur-md'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/80',
      borderColor: 'border-blue-400/50',
      textColor: 'text-white',
      iconColor: 'text-white',
      backdropColor: 'backdrop-blur-md'
    }
  };

  const config = alertConfig[type] || alertConfig.info;
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3
          }}          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-50
            w-[clamp(280px,90vw,420px)]
            ${config.bgColor} ${config.borderColor} ${config.backdropColor}
            border backdrop-blur-md 
            shadow-2xl shadow-black/25 
            drop-shadow-lg drop-shadow-black/20
            rounded-xl min-h-[clamp(56px,8vh,70px)]
            flex items-center justify-center
            ${className}
          `}
          role="alert"
          aria-live="polite"        >          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm" />          {/* Content - Grid layout for perfect centering */}
          <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-2 xs:gap-3 w-full px-3 xs:px-4">
            {/* Icon */}
            <div className={`${config.iconColor} flex-shrink-0`}>
              <IconComponent className="w-[clamp(16px,4vw,22px)] h-[clamp(16px,4vw,22px)]" />
            </div>
            
            {/* Message - Truly centered */}
            <div className={`${config.textColor} np-medium text-[clamp(0.8rem,3.5vw,0.875rem)] leading-relaxed text-center min-w-0`}>
              {message}
            </div>
              {/* Close button */}
            <button
              onClick={handleClose}              className={`
                ${config.textColor} hover:${config.iconColor}
                transition-colors duration-200 p-1 rounded-full
                hover:bg-white/10 focus:outline-none focus:ring-2 
                focus:ring-white/30 focus:ring-offset-1 focus:ring-offset-transparent
                cursor-pointer flex-shrink-0
              `}
              aria-label="Close alert"
            >
              <X className="w-[clamp(14px,3.5vw,18px)] h-[clamp(14px,3.5vw,18px)]" />
            </button>
          </div>{/* Progress bar for auto-close */}
          {duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/50 rounded-b-xl"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  message: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  duration: PropTypes.number,
  className: PropTypes.string,
};

export default Alert;
