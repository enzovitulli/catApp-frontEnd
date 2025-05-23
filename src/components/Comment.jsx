import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';

export default function Comment({ comment }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReplies, setShowReplies] = useState(false);
  
  // This would be connected to the backend in a real implementation
  const handleLike = () => {
    // BACKEND: POST request to /api/comments/{comment.id}/like
    if (liked) {
      setLikeCount(prevCount => prevCount - 1);
    } else {
      setLikeCount(prevCount => prevCount + 1);
    }
    setLiked(!liked);
  };

  const handleReply = () => {
    // BACKEND: This should focus the reply input in the parent component
    // and set the replyTo property to this comment's ID
  };

  const toggleReplies = () => {
    // BACKEND: If replies aren't loaded yet, fetch them:
    // GET /api/comments/{comment.id}/replies
    setShowReplies(!showReplies);
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
              >
                {showReplies ? 'Ocultar' : 'Ver'} {comment.replyCount} {comment.replyCount === 1 ? 'respuesta' : 'respuestas'}
              </button>
            )}
          </div>
          
          {/* Replies section */}
          <AnimatePresence>
            {showReplies && comment.replies && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pl-3 border-l-2 border-gray-100"
              >
                {comment.replies.map(reply => (
                  <Comment key={reply.id} comment={reply} />
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
