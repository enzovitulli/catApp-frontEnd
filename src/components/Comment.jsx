import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { commentsApi } from '../services/api';

export default function Comment({ comment, onLike }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  
  // Handle liking a comment
  const handleLike = async () => {
    try {
      // Optimistic UI update
      if (liked) {
        setLikeCount(prevCount => prevCount - 1);
      } else {
        setLikeCount(prevCount => prevCount + 1);
      }
      setLiked(!liked);
      
      // Call parent's onLike handler (if provided)
      if (onLike) onLike(comment.id);
      
      // When backend is ready:
      // await commentsApi.likeComment(comment.id);
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic update
      setLiked(!liked);
      setLikeCount(prevCount => liked ? prevCount + 1 : prevCount - 1);
    }
  };

  const handleReply = () => {
    // This should focus the reply input in the parent component
    // and set the replyTo property to this comment's ID
    console.log('Reply to comment:', comment.id);
  };

  // Load replies if they haven't been loaded yet
  const toggleReplies = async () => {
    // If we already have replies, just toggle visibility
    if (replies.length > 0 || comment.replyCount === 0) {
      setShowReplies(!showReplies);
      return;
    }
    
    // Otherwise, load replies from API
    try {
      setIsLoadingReplies(true);
      
      // When backend is ready:
      // const response = await commentsApi.getReplies(comment.id);
      // const fetchedReplies = response.data;
      // setReplies(fetchedReplies);
      
      // For now, simulate API call with timeout
      setTimeout(() => {
        // Use the replies from the comment object (mock data)
        setReplies(comment.replies || []);
        setIsLoadingReplies(false);
        setShowReplies(true);
      }, 300);
    } catch (error) {
      console.error('Error loading replies:', error);
      setIsLoadingReplies(false);
    }
  };

  return (
    <div className="py-4 relative">
      <div className="flex items-start">
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {comment.userProfilePic ? (
            <img 
              src={comment.userProfilePic} 
              alt={comment.username}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-lavender-300 flex items-center justify-center">
              <span className="text-xs text-lavender-800 np-medium">
                {comment.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Comment content */}
        <div className="ml-3 flex-grow">
          <div className="flex items-baseline">
            <span className="np-medium text-sm">{comment.username}</span>
            <span className="ml-2 text-xs text-gray-500">{comment.timestamp}</span>
          </div>
          
          <p className="mt-1 text-gray-800">{comment.text}</p>
          
          <div className="mt-2 flex items-center text-xs text-gray-600">
            <button 
              onClick={handleReply}
              className="hover:text-lavender-600 transition-colors"
            >
              Responder
            </button>
            
            {comment.replyCount > 0 && (
              <button 
                onClick={toggleReplies}
                className="ml-4 hover:text-lavender-600 transition-colors flex items-center"
                disabled={isLoadingReplies}
              >
                {isLoadingReplies ? (
                  <span className="flex items-center">
                    <span className="w-3 h-3 border-t border-lavender-500 rounded-full animate-spin mr-1"></span>
                    Cargando...
                  </span>
                ) : (
                  <span>
                    {showReplies ? 'Ocultar' : 'Ver'} {comment.replyCount} {comment.replyCount === 1 ? 'respuesta' : 'respuestas'}
                  </span>
                )}
              </button>
            )}
          </div>
          
          {/* Replies section */}
          <AnimatePresence>
            {showReplies && replies.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pl-3 border-l-2 border-gray-100"
              >
                {replies.map(reply => (
                  <Comment key={reply.id} comment={reply} onLike={onLike} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Like button */}
        <div className="flex flex-col items-center ml-3">
          <motion.button
            whileTap={{ scale: 1.2 }}
            onClick={handleLike}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <Heart 
              size={18} 
              className={`${liked ? 'fill-lavender-500 text-lavender-500' : 'text-gray-400'}`} 
            />
          </motion.button>
          <span className="text-xs text-gray-500 mt-1">{likeCount}</span>
        </div>
      </div>
    </div>
  );
}
