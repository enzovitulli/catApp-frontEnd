import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate, useSpring } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import Comment from './Comment';
import { commentsApi } from '../services/api';

export default function CommentSection({ isOpen, onClose, catId }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Track if we're in the process of closing
  const [isClosing, setIsClosing] = useState(false);
  
  // Animation spring configuration - used for both input and comment section
  const springConfig = {
    type: 'spring',
    stiffness: 300,
    damping: 26,
    mass: 0.8,
    velocity: 0
  };

  // Animation controls
  const sheetY = useMotionValue('100%');
  const sheetHeight = useMotionValue('0%');
  const inputY = useMotionValue('100%'); // New motion value for input bar
  
  // View state: closed (0), partial (1), or full (2)
  const [viewState, setViewState] = useState(0);
  
  // Element refs
  const commentSectionRef = useRef(null);
  const commentsListRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const dragConstraintsRef = useRef(null);

  // Scroll tracking for rubber band effect
  const scrollY = useMotionValue(0);
  const scrollYSpring = useSpring(scrollY, {
    stiffness: 300, 
    damping: 40,
    mass: 0.75
  });
  
  // Handle opening and closing transitions
  useEffect(() => {
    if (isOpen && !isClosing) {
      // Opening
      setViewState(1);
      animateToState(1);
    } else if (!isOpen && !isClosing) {
      // Already closed
      setViewState(0);
    }
    // Note: Closing is handled separately via handleClose
  }, [isOpen]);

  // Handle smooth closing
  const handleClose = () => {
    setIsClosing(true);
    
    // Animate to closed state
    animateToState(0).then(() => {
      // After animation completes, actually close
      setIsClosing(false);
      onClose();
    });
  };

  // Handle outside clicks for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load comments based on catId
  useEffect(() => {
    if (!isOpen || !catId) return;
    
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        
        // Get comments from API (real or mock based on config)
        const response = await commentsApi.getCommentsByCatId(catId, sortBy);
        setComments(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [isOpen, catId, sortBy]);

  // Function to animate to a specific state
  const animateToState = async (state) => {
    setViewState(state);
    
    // Define target values for each state
    let targetY, targetHeight, targetInputY;
    
    switch(state) {
      case 0: // Hidden (closed)
        targetY = '100%';
        targetHeight = '0%';
        targetInputY = '100%'; // Input bar slides down at same rate
        break;
      case 1: // Partial view
        targetY = '35%';
        targetHeight = '65%';
        targetInputY = '0%';  // Input bar stays visible
        break;
      case 2: // Full view
        targetY = '0%';
        targetHeight = '100%';
        targetInputY = '0%';  // Input bar stays visible
        break;
      default:
        targetY = '100%';
        targetHeight = '0%';
        targetInputY = '100%';
    }
    
    // Return a promise that resolves when all animations complete
    return Promise.all([
      animate(sheetY, targetY, springConfig).then(),
      animate(sheetHeight, targetHeight, springConfig).then(),
      animate(inputY, targetInputY, springConfig).then() // Animate input bar with the same timing
    ]);
  };

  // Natural dragging behavior with direct manipulation
  const handleDrag = (_, info) => {
    // Calculate current position as percentage
    const viewportHeight = window.innerHeight;
    const currentOffset = info.offset.y;
    const percentageOffset = (currentOffset / viewportHeight) * 100;
    
    // Apply constraints - prevent dragging above top boundary
    const constrainedY = Math.max(0, percentageOffset);
    
    // Update position directly based on drag for responsive feel
    if (viewState === 1) {
      // In partial view (starting from 35%)
      const newY = 35 + constrainedY;
      const newHeight = Math.max(5, 65 - constrainedY); // Prevent collapse below 5%
      
      // Update motion values directly for immediate feedback
      sheetY.set(`${newY}%`);
      sheetHeight.set(`${newHeight}%`);
    } else if (viewState === 2) {
      // In full view (starting from 0%)
      const newY = constrainedY;
      const newHeight = Math.max(5, 100 - constrainedY);
      
      sheetY.set(`${newY}%`);
      sheetHeight.set(`${newHeight}%`);
    }
  };

  // Handle drag end with natural snapping
  const handleDragEnd = (_, info) => {
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
        // Dragging down significantly from partial view - close
        handleClose();
      } else if (!isDraggingDown && (significantDrag || significantVelocity)) {
        // Dragging up significantly from partial view - go to full
        animateToState(2);
      } else {
        // Return to partial view
        animateToState(1);
      }
    } else if (viewState === 2) {
      // From full view
      if (isDraggingDown && (significantDrag || significantVelocity)) {
        // Dragging down significantly from full view - go to partial
        animateToState(1);
      } else {
        // Return to full view
        animateToState(2);
      }
    }
  };
  
  // Function to cycle through view states on handle click
  const cycleViewState = () => {
    if (viewState === 1) animateToState(2);
    else if (viewState === 2) animateToState(1);
  };
  
  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !catId) return;
    
    try {
      // Submit comment to API
      const response = await commentsApi.addComment(catId, {
        text: commentText,
        parentId: replyTo
      });
      
      const newComment = response.data;
      
      // Update UI with new comment
      if (replyTo) {
        // Add reply to existing comment
        setComments(comments.map(comment => {
          if (comment.id === replyTo) {
            return {
              ...comment,
              replyCount: comment.replyCount + 1,
              replies: [...(comment.replies || []), newComment]
            };
          }
          return comment;
        }));
      } else {
        // Add new top-level comment
        setComments([newComment, ...comments]);
      }
      
      // Clear input
      setCommentText('');
      setReplyTo(null);
      
    } catch (error) {
      console.error('Error posting comment:', error);
      // Could show an error message to the user here
    }
  };
  
  // Handle liking a comment
  const handleLikeComment = async (commentId) => {
    try {
      await commentsApi.likeComment(commentId);
      // The UI update is handled in the Comment component
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  // Handle sorting comments
  const handleSort = (sortOption) => {
    setSortBy(sortOption);
    setShowSortDropdown(false);
  };

  // Function to handle scroll in comments list with improved rubber band effect
  const handleScroll = (e) => {
    const target = e.target;
    
    // Check if we're at the bottom of the scroll (with small buffer)
    const isAtBottom = Math.abs(
      target.scrollHeight - target.scrollTop - target.clientHeight
    ) < 10;
    
    // Store a reference to whether we're at the bottom
    target.dataset.isAtBottom = isAtBottom;
  };

  // Handle the overscroll effect on touch devices
  const handleTouchMove = (e) => {
    const target = commentsListRef.current;
    if (!target) return;
    
    // If already at the bottom and trying to scroll further
    if (target.dataset.isAtBottom === 'true') {
      const touch = e.touches[0];
      const startY = parseInt(target.dataset.touchStartY || touch.clientY);
      const currentY = touch.clientY;
      
      // Dragging up (trying to scroll past the end)
      if (startY > currentY) {
        // Calculate how much we've pulled beyond the end
        const overscroll = Math.min((startY - currentY) * 0.3, 100);
        
        // Apply resistance - the further we pull, the harder it gets
        scrollY.set(-overscroll);
      }
    }
  };

  const handleTouchStart = (e) => {
    const target = commentsListRef.current;
    if (!target) return;
    
    // Remember where the touch started
    target.dataset.touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    // Spring back to the original position with a bouncy effect
    animate(scrollY, 0, {
      type: "spring",
      stiffness: 200,
      damping: 15, // Lower damping for more bounce
      mass: 0.8,
      velocity: scrollY.getVelocity() / 2 // Use current velocity for natural feel
    });
  };

  return (
    <>
      {/* The input bar - synchronized with comment section */}
      {(isOpen || isClosing) && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white pb-safe z-[2100]"
          style={{ y: inputY }} // Use the motion value directly
          initial={{ y: '100%' }}
        >
          <form 
            onSubmit={handleSubmitComment} 
            className="px-4 py-3 bg-white flex items-center"
          >
            {replyTo && (
              <div className="absolute -top-8 left-0 right-0 bg-gray-50 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
                <span>
                  Respondiendo a {comments.find(c => c.id === replyTo)?.username}
                </span>
                <button 
                  type="button" 
                  onClick={() => setReplyTo(null)}
                  className="text-lavender-600"
                >
                  Cancelar
                </button>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-lavender-300 flex items-center justify-center">
              <span className="text-xs text-lavender-800 np-medium">TÚ</span>
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyTo ? "Escribe tu respuesta..." : "Añadir un comentario..."}
              className="flex-1 py-2 px-3 mx-2 rounded-full border border-gray-300 focus:outline-none focus:border-lavender-500"
            />
            <motion.button 
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!commentText.trim()}
              className="bg-lavender-500 text-white np-medium rounded-full px-4 py-2 disabled:opacity-50"
            >
              Publicar
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* Comment section body */}
      <AnimatePresence>
        {(isOpen || isClosing) && (
          <motion.div
            ref={dragConstraintsRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 'var(--z-comments)' }}
            initial={false}
          >
            <motion.div 
              ref={commentSectionRef}
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg flex flex-col pointer-events-auto overflow-hidden"
              style={{ 
                y: sheetY,
                height: sheetHeight,
                maxHeight: '95vh',
                touchAction: 'none',
                paddingBottom: '60px'
              }}
              drag="y"
              dragDirectionLock
              dragElastic={0.08}
              dragConstraints={{ top: 0 }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              dragTransition={{
                power: 0.15,
                timeConstant: 300,
              }}
            >
              {/* Drag handle indicator - Removed bottom border */}
              <div 
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing bg-white relative z-30"
                onClick={cycleViewState}
              >
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Comment section header - Increased z-index and added solid background */}
              <div className="flex justify-between items-center px-6 py-3 sticky top-0 bg-white border-b border-gray-100 z-20 shadow-sm">
                <h2 className="np-semibold text-lg text-center w-full">Comentarios</h2>
              </div>
              
              {/* Sort options - Added proper z-index and better background isolation */}
              <div className="px-6 py-2 border-b border-gray-100 flex bg-white sticky top-[60px] z-10">
                <div className="relative" ref={sortDropdownRef}>
                  <button 
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center text-sm text-gray-700 hover:text-lavender-600 transition-colors"
                  >
                    Ordenar por: {sortBy === 'recent' ? 'Más recientes' : 'Más gustados'}
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                  
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-1 left-0 bg-white shadow-lg rounded-lg py-1 min-w-[180px] z-20"
                      >
                        <button 
                          onClick={() => handleSort('recent')}
                          className={`px-4 py-2 w-full text-left text-sm ${sortBy === 'recent' ? 'text-lavender-600 bg-lavender-50' : 'text-gray-700'} hover:bg-gray-50`}
                        >
                          Más recientes
                        </button>
                        <button 
                          onClick={() => handleSort('likes')}
                          className={`px-4 py-2 w-full text-left text-sm ${sortBy === 'likes' ? 'text-lavender-600 bg-lavender-50' : 'text-gray-700'} hover:bg-gray-50`}
                        >
                          Más gustados
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Create a separate scroll container with proper overflow behavior */}
              <div className="relative flex-grow overflow-hidden">
                {/* Comments list with rubber band effect */}
                <motion.div 
                  ref={commentsListRef}
                  className="absolute inset-0 overflow-y-auto"
                  style={{ 
                    y: scrollYSpring,
                    paddingBottom: '90px'
                  }}
                  onScroll={handleScroll}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lavender-500"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="divide-y divide-gray-100 px-4">
                      {comments.map(comment => (
                        <Comment 
                          key={comment.id} 
                          comment={comment}
                          onLike={() => handleLikeComment(comment.id)}
                        />
                      ))}
                      
                      {/* End message - removed bottom border by making it the last div without a border-bottom */}
                      <div className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 border-b-0">
                        {comments.length > 5 ? 'No hay más comentarios que cargar' : 'Fin de los comentarios'}
                      </div>
                      
                      {/* Extra padding to ensure content is scrollable */}
                      <div className="h-20 border-t-0"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <p className="text-gray-500">No hay comentarios todavía</p>
                      <p className="text-sm text-gray-400 mt-1">¡Sé el primero en comentar!</p>
                      
                      {/* Extra padding for scrollability */}
                      <div className="h-20"></div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
