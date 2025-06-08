import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useMotionValue, animate, useSpring } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { cardsApi } from '../services/api';
import { calculateAge } from './Card'; // Import the helper function
import Button from '../components/Button'; // Import Button component
import Pill from './Pill'; // Import Pill component

export default function PetDetailSection({ isOpen, onClose, petId, onImageModalOpen }) {  // Enhanced tracking for reopening
  const [readyToOpen, setReadyToOpen] = useState(true);
  const [petDetails, setPetDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [bottomPadding, setBottomPadding] = useState(20);
  
  // Animation spring configuration
  const springConfig = {
    type: 'spring',
    stiffness: 280,
    damping: 32,
    mass: 1.0,
    velocity: 0
  };

  // Faster closing animation configuration
  const closingSpringConfig = {
    type: 'spring',
    stiffness: 250,
    damping: 30,
    mass: 1.0,
    velocity: 0
  };

  // Animation controls
  const sheetY = useMotionValue('100%');
  const sheetHeight = useMotionValue('0%');
  
  // View state: closed (0), partial (1), or full (2)
  const [viewState, setViewState] = useState(0);
  
  // References for measuring content
  const detailSectionRef = useRef(null);
  const detailsListRef = useRef(null);
  const dragConstraintsRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);

  // Enhanced interaction state tracking
  const interactionState = useRef({
    gestureType: null, // "header-drag", "content-scroll", "content-drag", or null
    dragStartY: 0,
    dragStartScrollTop: 0,
    isScrollAtTopOnStart: false,
    lastEventTime: 0,
    isDragging: false
  });
  
  // Scroll tracking for rubber band effect
  const scrollY = useMotionValue(0);
  const scrollYSpring = useSpring(scrollY, {
    stiffness: 300, 
    damping: 40,
    mass: 0.75
  });
  
  // Debug ref to track component state across renders with unique ID
  const debugRef = useRef({
    openCount: 0,
    closeCount: 0,
    lastSheetYValue: '100%',
    instanceId: Math.random().toString(36).substring(2, 11)
  });
    // Clear pet details when changing pets
  useEffect(() => {
    if (!isOpen) {
      setPetDetails(null);
    }
  }, [petId, isOpen]);

  // Helper function to get all valid images
  const getValidImages = () => {
    if (!petDetails) return [];
    return [
      petDetails.imagen1,
      petDetails.imagen2,
      petDetails.imagen3,
      petDetails.imagen4
    ].filter(img => img && img.trim() !== '');  };  // Simple image click handler that uses callback to parent
  const handleImageClick = (imageIndex) => {
    console.log('handleImageClick called with index:', imageIndex);
    if (onImageModalOpen && petDetails) {
      const validImages = getValidImages();
      onImageModalOpen(validImages, imageIndex, petDetails.nombre);
    }
  };  // Simplified click handler for images - no complex touch logic needed
  const handleImageClickSimple = (imageIndex, event) => {
    event.stopPropagation();
    handleImageClick(imageIndex);
  };
  // Helper function to get size label
  const getSizeLabel = (size) => {
    if (size === 'pequeño') return 'Pequeño';
    if (size === 'mediano') return 'Mediano';
    return 'Grande';
  };

  // Helper function to determine status type for kids compatibility
  const getKidsCompatibilityStatus = (value) => {
    switch(value) {
      case "excelente":
      case "bueno":
        return "positive";
      case "precaucion":
        return "warning";
      case "noRecomendado":
        return "negative";
      case "desconocido":
        return "unknown";
      default:
        return "unknown";
    }
  };

  // Helper function to determine status type for pets compatibility
  const getPetsCompatibilityStatus = (value) => {
    switch(value) {
      case "excelente":
      case "bienConPerros":
      case "bienConGatos":
        return "positive";
      case "selectivo":
        return "warning";
      case "prefiereSolo":
        return "negative";
      case "desconocido":
        return "unknown";
      default:
        return "unknown";
    }
  };

  // Helper function to determine status type for apartment compatibility
  const getApartmentCompatibilityStatus = (value) => {
    switch(value) {
      case "ideal":
      case "bueno":
        return "positive";
      case "requiereEspacio":
        return "warning";
      case "soloConJardin":
        return "negative";
      case "desconocido":
        return "unknown";
      default:
        return "unknown";
    }
  };

  // Helper function to get status type based on compatibility type and value
  const getStatusType = (compatibilityType, compatibilityValue) => {
    if (compatibilityType === "apto_ninos") {
      return getKidsCompatibilityStatus(compatibilityValue);
    }
    if (compatibilityType === "compatibilidad_mascotas") {
      return getPetsCompatibilityStatus(compatibilityValue);
    }
    if (compatibilityType === "apto_piso_pequeno") {
      return getApartmentCompatibilityStatus(compatibilityValue);
    }
    if (typeof compatibilityValue === "boolean") {
      return compatibilityValue ? "positive" : "negative";
    }
    return "unknown";
  };
  
  // Handle opening and closing transitions with improved state management
  useEffect(() => {
    console.log(`[${debugRef.current.instanceId}] Effect triggered: isOpen=${isOpen}, isClosing=${isClosing}, viewState=${viewState}, readyToOpen=${readyToOpen}`);
    
    if (isOpen && !isClosing && readyToOpen) {
      // Reset interaction state completely
      interactionState.current = {
        gestureType: null,
        dragStartY: 0,
        dragStartScrollTop: 0, 
        isScrollAtTopOnStart: false,
        lastEventTime: 0,
        isDragging: false
      };
      
      // Opening: Count opens and log position
      debugRef.current.openCount++;
      console.log(`[${debugRef.current.instanceId}] Opening component (${debugRef.current.openCount} times), starting position:`, sheetY.get());
      
      // Force reset sheet position to ensure it starts from bottom
      sheetY.set('100%');
      sheetHeight.set('0%');
        // Reset scroll position and tracking state only when opening fresh
      if (detailsListRef.current) {
        detailsListRef.current.scrollTop = 0;
        // Clear any data attributes
        detailsListRef.current.removeAttribute('data-is-at-bottom');
        detailsListRef.current.removeAttribute('data-is-at-top');
        detailsListRef.current.removeAttribute('data-touch-start-y');
      }
      
      // Reset motion values
      scrollY.set(0);
      
      // Opening animation with minimal delay
      requestAnimationFrame(() => {
        console.log(`[${debugRef.current.instanceId}] Starting animation immediately`);
        setViewState(1);
        animateToState(1);
      });
    } else if (!isOpen && !isClosing) {
      // Already closed
      setViewState(0);
      // Reset scroll position for next open
      scrollY.set(0);
      // Make sure to reset this flag when fully closed
      setReadyToOpen(true);
      console.log(`[${debugRef.current.instanceId}] Component is closed, position:`, sheetY.get());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isClosing, readyToOpen]);

  // Handle smooth closing with faster animation and better cleanup
  const handleClose = () => {
    if (isClosing) return; // Prevent multiple close calls
    
    console.log(`[${debugRef.current.instanceId}] handleClose called, current position:`, sheetY.get());
    setIsClosing(true);
    // Prevent reopening until fully closed
    setReadyToOpen(false);
    
    // Clear any ongoing gesture
    interactionState.current.gestureType = null;
    interactionState.current.isDragging = false;
    
    // Animate to closed state with faster closing animation
    animateToState(0, true).then(() => {
      // Log after animation completes
      debugRef.current.closeCount++;
      console.log(`[${debugRef.current.instanceId}] Component closed (${debugRef.current.closeCount} times), final position:`, sheetY.get());
      debugRef.current.lastSheetYValue = sheetY.get();
      
      // After animation completes, reset states
      setIsClosing(false);
      
      // Ensure sheet is completely at the bottom
      sheetY.set('100%');
      sheetHeight.set('0%');
        // Clear all tracking variables - but preserve scroll position when just changing states
      if (detailsListRef.current) {
        // Only reset scroll when fully closing, not when transitioning between states
        // This preserves user's scroll position during partial/full state changes
      }
      interactionState.current = {
        gestureType: null,
        dragStartY: 0,
        dragStartScrollTop: 0,
        isScrollAtTopOnStart: false,
        lastEventTime: 0,
        isDragging: false
      };
      
      // Allow immediate callback without extra delay
      onClose();
      
      // Make ready to open again by next tick
      requestAnimationFrame(() => {
        setReadyToOpen(true);
      });
    });
  };

  // Load pet details based on petId with improved caching
  useEffect(() => {
    if (!isOpen || !petId) return;
    
    const fetchPetDetails = async () => {
      try {
        setIsLoading(true);
        
        // Get pet details from API
        const response = await cardsApi.getCardById(petId);
        setPetDetails(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching pet details:', error);
        setPetDetails(null);
        setIsLoading(false);
      }
    };
    
    fetchPetDetails();
  }, [isOpen, petId]);

  // Adjust bottom padding based on content height - with proper null checking
  useEffect(() => {
    if (!petDetails || !isOpen) return;
      // Use ResizeObserver to detect changes in content size
    const resizeObserver = new ResizeObserver(() => {
      if (!contentRef.current || !detailsListRef.current) return;
      
      try {
        const containerHeight = detailsListRef.current.clientHeight;
        const contentHeight = contentRef.current.scrollHeight;
        
        // If content is shorter than container, add padding to allow scrolling
        if (contentHeight < containerHeight) {
          setBottomPadding(Math.max(containerHeight - contentHeight, 5));
        } else {
          setBottomPadding(5);
        }
      } catch (e) {
        console.warn("ResizeObserver error:", e);
        setBottomPadding(20); // Fallback value
      }
    });
    
    // Only observe if both refs are available
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    return () => {
      // Make sure to disconnect properly
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [petDetails, viewState, isOpen]);

  // Helper function to format a date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(date);
  };

  // Helper function to get compatibility description text based on value
  const getCompatibilityDescription = (type, value) => {
    if (!value) return "No hay información disponible";
    
    const descriptions = {
      // Compatibility with children descriptions
      "apto_ninos": {
        "excelente": "Excelente con niños de todas las edades",
        "bueno": "Bueno con niños mayores y respetuosos",
        "precaucion": "Puede estar con niños bajo supervisión",
        "noRecomendado": "No recomendado para hogares con niños",
        "desconocido": "No se ha probado con niños"
      },
      // Compatibility with other pets descriptions
      "compatibilidad_mascotas": {
        "excelente": "Se lleva bien con todo tipo de mascotas",
        "bienConPerros": "Se lleva bien con perros",
        "bienConGatos": "Se lleva bien con gatos",
        "selectivo": "Selectivo con otras mascotas",
        "prefiereSolo": "Prefiere ser la única mascota",
        "desconocido": "No se ha probado con otras mascotas"
      },
      // Compatibility with apartments descriptions
      "apto_piso_pequeno": {
        "ideal": "Ideal para apartamento, tranquilo",
        "bueno": "Adecuado para apartamento con ejercicio regular",
        "requiereEspacio": "Necesita espacio y salidas diarias",
        "soloConJardin": "Requiere casa con jardín",
        "desconocido": "No se ha probado en apartamento"
      }
    };
    
    return descriptions[type]?.[value] || "No hay información disponible";
  };

  // Function to animate to a specific state - improved promise handling
  const animateToState = async (state, isClosing = false) => {
    console.log(`[${debugRef.current.instanceId}] Animating to state: ${state}, isClosing: ${isClosing}, from position:`, sheetY.get());
    
    setViewState(state);
    
    // Define target values for each state
    let targetY, targetHeight;    switch(state) {
      case 1: // Partial view
        targetY = '20%';
        targetHeight = '80%';
        break;
      case 2: // Full view
        targetY = '0%';
        targetHeight = '100%';
        break;
      case 0: // Hidden (closed)
      default:
        // For closed state or any unexpected state
        targetY = '100%';
        targetHeight = '0%';
    }
    
    // Use different spring configuration based on closing or opening
    const config = isClosing ? closingSpringConfig : springConfig;
    
    console.log(`[${debugRef.current.instanceId}] Animation target: y=${targetY}, height=${targetHeight}`);
    
    // Return a promise that resolves when all animations complete
    return Promise.all([
      animate(sheetY, targetY, config),
      animate(sheetHeight, targetHeight, config),
    ]).then(() => {
      console.log(`[${debugRef.current.instanceId}] Animation completed: sheetY = ${sheetY.get()}, sheetHeight = ${sheetHeight.get()}`);
      return true;
    });
  };

  // Header drag handler with improved isolation and tracking
  const handleHeaderDrag = (_, info) => {
    // Skip if we're closing
    if (isClosing) return;
    
    // Mark that we're dragging via header
    interactionState.current.gestureType = "header-drag";
    interactionState.current.isDragging = true;
    
    // Calculate current position as percentage
    const viewportHeight = window.innerHeight;
    const currentOffset = info.offset.y;
    const percentageOffset = (currentOffset / viewportHeight) * 100;
    
    // Apply constraints - prevent dragging above top boundary
    const constrainedY = Math.max(0, percentageOffset);
    
    // Update position directly based on drag for responsive feel
    if (viewState === 1) {
      // In partial view
      if (currentOffset < 0) {
        // Opening: Follow finger precisely without damping for more responsive feel
        const newY = Math.max(0, 20 + percentageOffset); // Linear movement with minimum bound
        const newHeight = Math.min(100, 80 - percentageOffset); // Linear height adjustment
        
        sheetY.set(`${newY}%`);
        sheetHeight.set(`${newHeight}%`);
      } else {
        // Closing: Use existing logic
        const newY = 20 + constrainedY;
        const newHeight = Math.max(5, 80 - constrainedY);
        
        sheetY.set(`${newY}%`);
        sheetHeight.set(`${newHeight}%`);
      }
    } else if (viewState === 2) {
      // In full view
      const newY = constrainedY;
      const newHeight = Math.max(5, 100 - constrainedY);
      
      sheetY.set(`${newY}%`);
      sheetHeight.set(`${newHeight}%`);
    }
  };

  // Header drag end handler with improved state reset
  const handleHeaderDragEnd = (_, info) => {
    // Clear the gesture state
    interactionState.current.gestureType = null;
    interactionState.current.isDragging = false;
    
    // Skip if we're in the process of closing
    if (isClosing) return;
    
    // Calculate how far the user dragged as percentage of screen height
    const viewportHeight = window.innerHeight;
    const dragDistance = info.offset.y;
    const dragPercentage = (dragDistance / viewportHeight) * 100;
    
    // Calculate velocity as % of viewport height per second
    const velocity = (info.velocity.y / viewportHeight) * 1000;
    
    // Direction and thresholds
    const isDraggingDown = dragDistance > 0;
    const significantVelocity = Math.abs(velocity) > 20; // Fast flick
    const significantDrag = Math.abs(dragPercentage) > 10; // Substantial movement
    
    if (viewState === 1) {
      // From partial view
      if (isDraggingDown && (significantDrag || significantVelocity)) {
        // Dragging down from partial view - close
        handleClose();
      } else if (!isDraggingDown && (significantDrag || significantVelocity)) {
        // Dragging up from partial view - go to full
        animateToState(2);
      } else {
        // Return to partial view
        animateToState(1);
      }
    } else if (viewState === 2) {
      // From full view
      if (isDraggingDown && (significantDrag || significantVelocity)) {
        // Dragging down from full view - go to partial
        animateToState(1);
      } else {
        // Return to full view
        animateToState(2);
      }
    }
  };
  
  // Function to cycle through view states on handle click
  const cycleViewState = () => {
    // Skip if we're closing
    if (isClosing) return;
    
    // Clear any ongoing gesture tracking to prevent conflicts
    interactionState.current.gestureType = null;
    interactionState.current.isDragging = false;
    
    if (viewState === 1) animateToState(2);
    else if (viewState === 2) animateToState(1);
  };
  // Content touch handlers with better isolation
  const handleContentTouchStart = (e) => {
    // Skip if we're closing or if this is an image interaction
    if (isClosing || interactionState.current.gestureType === "image-interaction") return;
    e.stopPropagation(); // Stop event from bubbling to header
    
    if (!detailsListRef.current) return;
    
    // Store the initial touch position
    interactionState.current.dragStartY = e.touches[0].clientY;
    interactionState.current.lastEventTime = Date.now();
    
    // Store the initial scroll position
    interactionState.current.dragStartScrollTop = detailsListRef.current.scrollTop;
    
    // Check if we're at the top of scroll when starting
    interactionState.current.isScrollAtTopOnStart = detailsListRef.current.scrollTop <= 1;
  };
  // Touch move handler with strict separation between drag and scroll
  const handleContentTouchMove = (e) => {
    // Skip if we're closing or if this is an image interaction
    if (isClosing || interactionState.current.gestureType === "image-interaction") return;
    e.stopPropagation(); // Stop event from bubbling to header
    
    if (!detailsListRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - interactionState.current.dragStartY;
    const isScrollAtTop = detailsListRef.current.scrollTop <= 1;
    
    // If we haven't determined gesture type yet, do so now
    if (!interactionState.current.gestureType) {
      // If at top and dragging down, this is content-drag
      if (isScrollAtTop && deltaY > 5) { // Small threshold to avoid accidental triggers
        interactionState.current.gestureType = "content-drag";
        interactionState.current.isDragging = true;
      } 
      // Otherwise it's content-scroll (normal scrolling)
      else {
        interactionState.current.gestureType = "content-scroll";
      }
    }
    
    // Handle rubber band effect at bottom only during content-scroll
    if (interactionState.current.gestureType === "content-scroll" && 
        detailsListRef.current.dataset.isAtBottom === 'true') {
      const touch = e.touches[0];
      const startY = parseInt(detailsListRef.current.dataset.touchStartY || touch.clientY);
      
      if (startY > currentY) {
        // Calculate how much we've pulled beyond the end
        const overscroll = Math.min((startY - currentY) * 0.3, 100);
        
        // Apply resistance - the further we pull, the harder it gets
        scrollY.set(-overscroll);
      }
    }
    
    // Only handle dragging the sheet when in content-drag mode
    if (interactionState.current.gestureType === "content-drag" && isScrollAtTop && deltaY > 0) {
      // Calculate how much to move the sheet based on drag
      const viewportHeight = window.innerHeight;
      const percentageDelta = (deltaY / viewportHeight) * 100;
      
      // Apply the drag to the sheet without preventing default
      if (viewState === 1) {
        const resistanceFactor = 0.4;
        const newY = 20 + percentageDelta * resistanceFactor;
        const newHeight = Math.max(5, 80 - percentageDelta * resistanceFactor);
        sheetY.set(`${newY}%`);
        sheetHeight.set(`${newHeight}%`);
      } else if (viewState === 2) {
        const resistanceFactor = 0.4;
        const newY = percentageDelta * resistanceFactor;
        const newHeight = Math.max(5, 100 - percentageDelta * resistanceFactor);
        sheetY.set(`${newY}%`);
        sheetHeight.set(`${newHeight}%`);
      }
    }
  };
  // Content touch end with better gesture tracking
  const handleContentTouchEnd = (e) => {
    // Skip if we're closing or if this was an image interaction
    if (isClosing || interactionState.current.gestureType === "image-interaction") {
      // Clear image interaction flag
      if (interactionState.current.gestureType === "image-interaction") {
        interactionState.current.gestureType = null;
      }
      return;
    }
    e.stopPropagation(); // Stop event from bubbling to header
    
    if (!detailsListRef.current) return;
    
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - interactionState.current.dragStartY;
    const isScrollAtTop = detailsListRef.current.scrollTop <= 1;
    const gestureType = interactionState.current.gestureType;
    
    // Check if this was a quick tap (not a drag)
    const isQuickTap = Date.now() - interactionState.current.lastEventTime < 300 && Math.abs(deltaY) < 10;
    
    // Clear gesture type
    interactionState.current.gestureType = null;
    interactionState.current.isDragging = false;
    
    // Spring back rubber band effect at the bottom
    animate(scrollY, 0, {
      type: "spring",
      stiffness: 200,
      damping: 15,
      mass: 0.8,
      velocity: scrollY.getVelocity() / 2
    });
    
    // If it was just a tap, don't change sheet position
    if (isQuickTap) return;
    
    // Only handle sheet movement if we were in a content-drag gesture
    if (gestureType === "content-drag" && isScrollAtTop && deltaY > 0) {
      const viewportHeight = window.innerHeight;
      const dragPercentage = (deltaY / viewportHeight) * 100;
      
      // Higher thresholds to prevent accidental state changes
      const significantDrag = dragPercentage > 15;
      
      if (significantDrag) {
        if (viewState === 2) {
          // From full view, go to partial view
          animateToState(1);
        } else if (viewState === 1) {
          // From partial view, close
          handleClose();
        }
      } else {
        // Not enough to change state, revert to current state
        animateToState(viewState);
      }
    } else {
      // Make sure the sheet stays in position
      animateToState(viewState);
    }
  };

  // Explicit event stopPropagation helper
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Improved scroll handler with cleaner state tracking
  const handleScroll = (e) => {
    if (!detailsListRef.current || isClosing) return;
    
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    
    // Update data attributes for scroll position state
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 5;
    detailsListRef.current.dataset.isAtBottom = isAtBottom ? 'true' : 'false';
    detailsListRef.current.dataset.isAtTop = scrollTop <= 1 ? 'true' : 'false';
      // Store touch start position for overscroll effects
    if (e.touches?.[0]) {
      detailsListRef.current.dataset.touchStartY = e.touches[0].clientY;
    }
  };
  // Status item renderer helper with simplified logic
  const renderPetStatusItem = (label, compatibilityValue, compatibilityType) => {
    // Default for null or undefined values
    if (compatibilityValue === null || compatibilityValue === undefined) {
      return (
        <div className="flex items-center mb-3">
          <HelpCircle size={20} className="text-gray-400 mr-3 flex-shrink-0" />
          <div>
            <span className="text-sm np-medium text-gray-800">{label}</span>
            <p className="text-xs text-gray-600 mt-0.5">No hay información disponible</p>
          </div>
        </div>
      );
    }

    const statusType = getStatusType(compatibilityType, compatibilityValue);
    const description = getCompatibilityDescription(compatibilityType, compatibilityValue);
    
    return (
      <div className="flex items-center mb-3">
        {statusType === "positive" ? (
          <CheckCircle size={20} className="text-aquamarine-600 mr-3 flex-shrink-0" />
        ) : statusType === "negative" ? (
          <XCircle size={20} className="text-orchid-600 mr-3 flex-shrink-0" />
        ) : statusType === "warning" ? (
          <AlertTriangle size={20} className="text-amber-500 mr-3 flex-shrink-0" />
        ) : (
          <HelpCircle size={20} className="text-gray-400 mr-3 flex-shrink-0" />
        )}
        <div>
          <span className="text-sm np-medium text-gray-800">{label}</span>
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
      </div>
    );
  };

  // Health status item renderer with boolean support
  const renderHealthStatusItem = (label, value, description = null) => {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return (
        <div className="flex items-center mb-3">
          <HelpCircle size={20} className="text-gray-400 mr-3 flex-shrink-0" />
          <div>
            <span className="text-sm np-medium text-gray-800">{label}</span>
            <p className="text-xs text-gray-600 mt-0.5">No hay información disponible</p>
          </div>
        </div>
      );
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-start mb-3">
          {value ? (
            <CheckCircle size={20} className="text-aquamarine-600 mr-3 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle size={20} className="text-orchid-600 mr-3 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="text-sm np-medium text-gray-800">{label}</span>
            <p className="text-xs text-gray-600 mt-0.5">{value ? 'Sí' : 'No'}</p>
            {/* Only show description section for health problems (when label includes "problema" and value is true) */}
            {value && label.toLowerCase().includes('problema') && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                <p className="np-semibold text-gray-800 mb-1">Descripción del problema de salud:</p>
                {description && description.trim() ? (
                  <p className="np-regular leading-relaxed">{description}</p>
                ) : (
                  <p className="np-regular leading-relaxed text-gray-500 italic">No se ha proporcionado una descripción específica del problema de salud.</p>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Fallback for other value types
    return (
      <div className="flex items-center mb-3">
        <HelpCircle size={20} className="text-gray-400 mr-3 flex-shrink-0" />
        <div>
          <span className="text-sm np-medium text-gray-800">{label}</span>
          <p className="text-xs text-gray-600 mt-0.5">No hay información disponible</p>
        </div>
      </div>
    );
  };

  // Button renderer with explicit click stopPropagation
  const renderAdoptButton = () => (
    <div 
      className="px-4 py-2 bg-white shadow-[0_-5px_5px_0px_rgba(0,0,0,0.05)] flex items-center justify-center"
      onClick={stopPropagation}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          stopPropagation(e);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Button 
        variant="primary"
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Adopt this pet:", petId);
        }}
      >
        Quiero adoptar a {petDetails?.nombre || "esta mascota"}
      </Button>
    </div>
  );  // A stable key pattern that doesn't cause remounting during state changes
  const getPanelKey = () => {
    return `pet-detail-${petId}`;
  };
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dragConstraintsRef}
            className="fixed inset-0 pointer-events-none touch-none"
            style={{ zIndex: 'var(--z-pet-details)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Main container */}
            <motion.div 
              ref={detailSectionRef}
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg flex flex-col pointer-events-auto overflow-hidden"
              style={{ 
                y: sheetY,
                height: sheetHeight,
                maxHeight: '95vh',
                touchAction: 'none',
              }}
              // Force complete remount with timestamp in the key
              key={getPanelKey()}
              initial={{ y: "100%", height: "0%" }}
              drag="y"
              dragDirectionLock
              dragElastic={0.08}
              dragConstraints={{ top: 0 }}
              onDrag={handleHeaderDrag}
              onDragEnd={handleHeaderDragEnd}
              dragTransition={{
                power: 0.15,
                timeConstant: 300,
              }}
            >
              {/* Header area - isolated gesture area */}
              <div 
                ref={headerRef}
                className="cursor-grab active:cursor-grabbing bg-white relative z-30 touch-none"
                onTouchStart={stopPropagation}
              >
                {/* Drag handle indicator */}                <div 
                  className="flex justify-center pt-3 pb-2"                  onClick={cycleViewState}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      cycleViewState();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Cycle view state"
                >
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>

                {/* Pet details header */}
                <div className="flex justify-between items-center px-6 py-3 sticky top-0 z-20 shadow-[0_5px_5px_0px_rgba(0,0,0,0.05)]">
                  <h2 className="np-semibold text-lg text-center w-full text-gray-800">Información de Adopción</h2>
                </div>
              </div>

              {/* Content area with isolated touch handling */}
              <div className="relative flex-grow overflow-hidden touch-none">
                <motion.div 
                  ref={detailsListRef}
                  className="absolute inset-0 overflow-y-auto touch-pan-y"
                  style={{ 
                    y: scrollYSpring,
                    paddingBottom: '60px',
                  }}
                  onScroll={handleScroll}
                  onTouchStart={handleContentTouchStart}
                  onTouchMove={handleContentTouchMove}
                  onTouchEnd={handleContentTouchEnd}
                  onClick={stopPropagation}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orchid-500"></div>
                    </div>
                  ) : petDetails ? (
                    <div ref={contentRef} className="px-5 pt-2 pb-12">
                      {/* Pet main info */}
                      <div className="pb-6 border-b border-gray-200">
                        <h1 className="text-2xl np-bold mb-1 text-gray-900">{petDetails.nombre}</h1>                        <div className="flex flex-wrap gap-2 mb-4">                          {/* Age Pill */}
                          {petDetails.fecha_nacimiento && (
                            <Pill>
                              {calculateAge(petDetails.fecha_nacimiento)} {calculateAge(petDetails.fecha_nacimiento) === 1 ? 'año' : 'años'}
                            </Pill>
                          )}
                          
                          {/* Gender Pill */}
                          <Pill>
                            {petDetails.genero === 'macho' ? 'Macho' : 'Hembra'}
                          </Pill>
                          
                          {/* Breed Pill - only show if breed exists and is not empty */}
                          {petDetails.raza && petDetails.raza.trim() && (
                            <Pill>
                              {petDetails.raza}
                            </Pill>
                          )}
                          
                          {/* Size Pill */}
                          {petDetails.tamano && (
                            <Pill>
                              {getSizeLabel(petDetails.tamano)}
                            </Pill>
                          )}
                        </div>{/* Pet image */}
                        <div 
                          className="mb-4 relative rounded-lg overflow-hidden aspect-video cursor-pointer hover:opacity-90 transition-opacity group"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Mark as image interaction to prevent conflicts
                            interactionState.current.gestureType = "image-interaction";
                            handleImageClick(0);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            interactionState.current.gestureType = "image-interaction";
                          }}
                        >                          <img 
                            src={petDetails.imagen1} 
                            alt={petDetails.nombre} 
                            className="w-full h-full object-cover filter blur-[0.5px] contrast-90 saturate-85 brightness-105"
                            style={{ 
                              touchAction: 'manipulation', 
                              transform: 'scale(1.02)',
                              imageRendering: '-webkit-optimize-contrast'
                            }}
                            draggable={false}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2">
                              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>                        {/* Additional images if available */}                        <div className="flex gap-2 pb-2">
                          {petDetails.imagen2 && (
                            <div 
                              className="relative cursor-pointer hover:opacity-90 transition-opacity group flex-1 aspect-square"
                              onClick={(e) => handleImageClickSimple(1, e)}
                        >                                <img 
                                src={petDetails.imagen2} 
                                alt={`${petDetails.nombre} 2`} 
                                className="w-full h-full object-cover rounded-lg filter blur-[0.5px] contrast-90 saturate-85 brightness-105"
                                style={{ 
                                  touchAction: 'manipulation',
                                  transform: 'scale(1.02)',
                                  imageRendering: '-webkit-optimize-contrast'
                                }}
                            />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center rounded-lg">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-1">
                                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}                          {petDetails.imagen3 && (
                            <div 
                              className="relative cursor-pointer hover:opacity-90 transition-opacity group flex-1 aspect-square"
                              onClick={(e) => handleImageClickSimple(2, e)}
                            >                              <img 
                                src={petDetails.imagen3} 
                                alt={`${petDetails.nombre} 3`} 
                                className="w-full h-full object-cover rounded-lg filter blur-[0.5px] contrast-90 saturate-85 brightness-105"
                                style={{ 
                                  touchAction: 'manipulation',
                                  transform: 'scale(1.02)',
                                  imageRendering: '-webkit-optimize-contrast'
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center rounded-lg">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-1">
                                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}                          {petDetails.imagen4 && (
                            <div 
                              className="relative cursor-pointer hover:opacity-90 transition-opacity group flex-1 aspect-square"
                              onClick={(e) => handleImageClickSimple(3, e)}
                            >                              <img 
                                src={petDetails.imagen4} 
                                alt={`${petDetails.nombre} 4`} 
                                className="w-full h-full object-cover rounded-lg filter blur-[0.5px] contrast-90 saturate-85 brightness-105"
                                style={{ 
                                  touchAction: 'manipulation',
                                  transform: 'scale(1.02)',
                                  imageRendering: '-webkit-optimize-contrast'
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center rounded-lg">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-1">
                                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Basic details section */}
                      <div className="py-5 border-b border-gray-200">
                        <h3 className="text-lg np-semibold mb-3 text-gray-800">Detalles básicos</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-sm">
                            <span className="text-gray-800 np-semibold">Raza:</span>
                            <p className="np-regular text-gray-600">{petDetails.raza || 'Mestizo'}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-800 np-semibold">Género:</span>
                            <p className="np-regular text-gray-600">{petDetails.genero === 'macho' ? 'Macho' : 'Hembra'}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-800 np-semibold">Edad:</span>
                            <p className="np-regular text-gray-600">
                              {petDetails.fecha_nacimiento ? 
                                `${calculateAge(petDetails.fecha_nacimiento)} ${calculateAge(petDetails.fecha_nacimiento) === 1 ? 'año' : 'años'}` : 
                                'Edad desconocida'
                              }
                            </p>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-800 np-semibold">Tamaño:</span>
                            <p className="np-regular text-gray-600">{getSizeLabel(petDetails.tamano)}</p>
                          </div>
                          <div className="text-sm col-span-2">
                            <span className="text-gray-800 np-semibold">Fecha de nacimiento:</span>
                            <p className="np-regular text-gray-600">{formatDate(petDetails.fecha_nacimiento)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pet compatibility */}
                      <div className="py-5 border-b border-gray-200">
                        <h3 className="text-lg np-semibold mb-3 text-gray-800">Compatibilidad</h3>
                        <div className="space-y-2">
                          {renderPetStatusItem(
                            'Apto para niños', 
                            petDetails.apto_ninos,
                            'apto_ninos'
                          )}
                          {renderPetStatusItem(
                            'Apto para otros animales', 
                            petDetails.compatibilidad_mascotas,
                            'compatibilidad_mascotas'
                          )}
                          {renderPetStatusItem(
                            'Apto para departamento', 
                            petDetails.apto_piso_pequeno,
                            'apto_piso_pequeno'
                          )}
                        </div>
                      </div>

                      {/* Health status - improved display */}
                      <div className="py-5 border-b border-gray-200">
                        <h3 className="text-lg np-semibold mb-3 text-gray-800">Estado de Salud</h3>
                        <div className="space-y-3">
                          {renderHealthStatusItem('Esterilizado', petDetails.esterilizado)}
                          {renderHealthStatusItem('Problema de salud', petDetails.problema_salud, petDetails.descripcion_salud)}
                        </div>
                      </div>
                      
                      {/* Temperament section - moved up */}
                      <div className="py-5 border-b border-gray-200">
                        <h3 className="text-lg np-semibold mb-3 text-gray-800">Temperamento</h3>
                        <p className="text-gray-700 np-regular">
                          {petDetails.temperamento || `No hay información sobre el temperamento de ${petDetails.nombre} todavía.`}
                        </p>
                      </div>

                      {/* Pet bio/history - moved to last and removed border */}
                      <div className="pt-5 pb-3">
                        <h3 className="text-lg np-semibold mb-3 text-gray-800">Historia</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {petDetails.historia ? (
                            <p className="text-gray-700 np-regular">{petDetails.historia}</p>
                          ) : (
                            <div className="flex flex-col items-center text-center py-4">
                              <HelpCircle size={32} className="text-gray-400 mb-2" />
                              <p className="text-gray-500 np-regular">No hay información sobre la historia de {petDetails.nombre} aún.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dynamic padding to ensure content is scrollable */}
                      <div style={{ height: `${bottomPadding}px` }}></div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <p className="text-gray-500">No se encontró información para esta mascota</p>
                      <p className="text-sm text-gray-400 mt-1">Por favor, intenta con otra mascota</p>
                      
                      <div className="h-4"></div>
                    </div>
                  )}

                  {/* Always show the adoption button when the panel is open */}
                  {!isLoading && renderAdoptButton()}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>        )}
      </AnimatePresence>
    </>
  );
}

// PropTypes validation
PetDetailSection.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  petId: PropTypes.string.isRequired,
  onImageModalOpen: PropTypes.func.isRequired,
};
