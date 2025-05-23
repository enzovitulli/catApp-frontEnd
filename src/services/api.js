import axios from 'axios';
import config from './config';

// Mock data
import { mockupCats, MOCK_COMMENTS_BY_CAT } from './mockData';

// Base API configuration
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Card-related API calls
export const cardsApi = {
  /**
   * Get all available cat cards
   * @returns {Promise<Array>} - Promise resolving to array of cat objects
   */
  getAllCards: () => {
    if (config.api.useMockData) {
      // Return mock data with artificial delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockupCats });
        }, 500);
      });
    }
    return apiClient.get('/cats/');
  },
  
  /**
   * Get a specific cat card by ID
   * @param {string|number} id - The cat ID
   * @returns {Promise<Object>} - Promise resolving to cat object
   */
  getCardById: (id) => {
    if (config.api.useMockData) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const cat = mockupCats.find(c => c.id === id);
          if (cat) {
            resolve({ data: cat });
          } else {
            reject(new Error('Cat not found'));
          }
        }, 300);
      });
    }
    return apiClient.get(`/cats/${id}/`);
  },
  
  /**
   * Like a cat (toggle like status)
   * @param {string|number} id - The cat ID
   * @returns {Promise<Object>} - Promise with updated like status
   */
  likeCat: (id) => {
    if (config.api.useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Mock liking cat with ID: ${id}`);
          resolve({ data: { success: true, liked: true } });
        }, 300);
      });
    }
    return apiClient.post(`/cats/${id}/like/`);
  },
};

// Comment-related API calls
export const commentsApi = {
  /**
   * Get comments for a specific cat
   * @param {string|number} catId - The cat ID to get comments for
   * @param {string} [sortBy='recent'] - Sort comments by 'recent' or 'likes'
   * @returns {Promise<Array>} - Promise resolving to array of comments
   */
  getCommentsByCatId: (catId, sortBy = 'recent') => {
    if (config.api.useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Get comments for this specific cat, or empty array if none
          const catComments = MOCK_COMMENTS_BY_CAT[catId] || [];
          
          // Sort comments if needed
          let sortedComments = [...catComments];
          if (sortBy === 'likes') {
            sortedComments.sort((a, b) => b.likeCount - a.likeCount);
          }
          
          resolve({ data: sortedComments });
        }, 500);
      });
    }
    return apiClient.get(`/cats/${catId}/comments/`, { params: { sort: sortBy } });
  },
  
  /**
   * Add a new comment to a cat
   * @param {string|number} catId - The cat ID to comment on
   * @param {Object} comment - Comment data
   * @param {string} comment.text - Comment content
   * @param {string|number|null} [comment.parentId] - Parent comment ID for replies
   * @returns {Promise<Object>} - Promise resolving to created comment
   */
  addComment: (catId, { text, parentId = null }) => {
    if (config.api.useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newComment = {
            id: Date.now(),
            username: "current_user",
            text,
            timestamp: "justo ahora",
            likeCount: 0,
            replyCount: 0,
            replies: [],
            parentId
          };
          resolve({ data: newComment });
        }, 300);
      });
    }
    return apiClient.post(`/cats/${catId}/comments/`, { text, parent: parentId });
  },
  
  /**
   * Get replies to a comment
   * @param {string|number} commentId - Parent comment ID
   * @returns {Promise<Array>} - Promise resolving to array of reply comments
   */
  getReplies: (commentId) => {
    if (config.api.useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Find the comment in the mock data
          let foundReplies = [];
          Object.values(MOCK_COMMENTS_BY_CAT).forEach(comments => {
            comments.forEach(comment => {
              if (comment.id === commentId && comment.replies) {
                foundReplies = comment.replies;
              }
            });
          });
          resolve({ data: foundReplies });
        }, 300);
      });
    }
    return apiClient.get(`/comments/${commentId}/replies/`);
  },
  
  /**
   * Like a comment (toggle like status)
   * @param {string|number} commentId - Comment ID to like/unlike
   * @returns {Promise<Object>} - Promise with updated like status
   */
  likeComment: (commentId) => {
    if (config.api.useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { success: true, liked: true } });
        }, 300);
      });
    }
    return apiClient.post(`/comments/${commentId}/like/`);
  },
};

export default apiClient;
